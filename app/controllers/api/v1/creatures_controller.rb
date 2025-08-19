class Api::V1::CreaturesController < Api::V1::BaseController
  def random
    # movementパラメータの処理を改善
    movement_param = params[:movement] || ['swim', 'float', 'rest'].sample
    discovered_ids = current_user&.books&.pluck(:creature_id) || []

    # enumの数値に変換
    movement_value = Creature.movements[movement_param]
    
    # movement_valueがnilの場合（無効なパラメータ）の処理
    unless movement_value
      render json: { error: 'Invalid movement parameter' }, status: 400
      return
    end
    
    creature = nil
    
    # 未発見の生き物を優先的に選択（ログイン時）
    if current_user && rand < 0.6
      undiscovered = Creature.where(movement: movement_value)
                            .where.not(id: discovered_ids)
      creature = undiscovered.sample if undiscovered.exists?
    end
    
    # 未発見がない場合や非ログイン時は普通にランダム
    creature ||= Creature.where(movement: movement_value).sample
    
    if creature
      begin
      svg_content = JSON.parse(creature.svg_data)["svg"] if creature.svg_data.present?
      rescue JSON::ParserError
        svg_content = creature.svg_data # 既にSVG文字列の場合
      end

      render json: {
        id: creature.id,
        name: creature.name,
        movement: creature.movement,
        size: creature.size,
        svg_content: svg_content,
        # image_url: creature.image.attached? ? url_for(creature.image) : nil,
        discovered: discovered_ids.include?(creature.id)
      }
    else
      render json: { error: 'No creature found' }, status: 404
    end
  end
  
  def show
    creature = Creature.find(params[:id])
    discovered_ids = current_user&.books&.pluck(:creature_id) || []
    
    render json: {
      id: creature.id,
      name: creature.name,
      description: creature.description,
      movement: creature.movement,
      size: creature.size,
      svg_content: svg_content,
      discovered: discovered_ids.include?(creature.id)
    }
  end
end