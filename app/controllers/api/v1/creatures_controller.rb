class Api::V1::CreaturesController < Api::V1::BaseController
  skip_before_action :require_login, only: [:random, :show]
  
  def random
    # movementパラメータの処理を改善
    movement_param = params[:movement] || ['swim', 'float', 'rest'].sample
    # enumの数値に変換
    movement_value = Creature.movements[movement_param]
    
    # movement_valueがnilの場合（無効なパラメータ）の処理
    unless movement_value
      render json: { error: 'Invalid movement parameter' }, status: 400
      return
    end
    
    # ユーザー名を取得させる
    base_query = Creature.joins(:user)
                      .select('creatures.*, users.name as creator_name')
                      .where(movement: movement_value)
    
    # ログイン時のみ未発見優先ロジック
    creature = nil
    if current_user
      discovered_ids = current_user.books.pluck(:creature_id)
      if discovered_ids.any? && rand < 0.6
        undiscovered = base_query.where.not(id: discovered_ids)
        creature = undiscovered.sample if undiscovered.exists?
      end
    end

    # 未発見がない場合や非ログイン時は普通にランダム
    creature ||= base_query.sample

    if creature
      # SVG処理
      svg_content = get_svg_content(creature)
      # 発見状態を返す（ログイン時のみ）
      is_discovered = current_user ? current_user.discovered?(creature) : false

      render json: {
        id: creature.id,
        name: creature.name,
        description: creature.description,
        movement: creature.movement,
        size: creature.size,
        svg_content: svg_content,
        creator_name: creature.creator_name,
        discovered: is_discovered,
        can_discover: current_user.present? && !is_discovered # 発見可能かどうか
      }
    else
      render json: { error: '生き物が見つかりませんでした' }, status: 404
    end
  end

  # 生き物発見用のエンドポイント
  def discover
    puts "🎯🎯🎯 discover アクションが呼ばれました！"
    puts "🎯 ユーザーID: #{current_user.id}"
    puts "🎯 生き物ID: #{params[:id]}"

    creature = Creature.find(params[:id])
    
    # 🎯 シンプルで安全な実装
    book = current_user.books.find_or_create_by(creature: creature) do |new_book|
      puts "✅ 新発見！Book を作成中..."
    end

    if book.persisted?
      if book.previously_new_record?
        puts "✅ 新発見成功: Book ID = #{book.id}"
        render json: { success: true, is_new_discovery: true }
      else
        puts "❌ 既に発見済み"
        render json: { success: true, is_new_discovery: false }
      end
    else
      puts "💥 作成エラー: #{book.errors.full_messages}"
      render json: { success: false, error: book.errors.full_messages.join(', ') }
    end
    rescue ActiveRecord::RecordNotFound
      render json: { success: false, error: '生き物が見つかりません' }, status: 404
    rescue => e
      puts "💥 予期しないエラー: #{e.message}"
      render json: { success: false, error: '発見処理中にエラーが発生しました' }
  end
  
  def show
    creature = Creature.joins(:user)
                      .select('creatures.*, users.name as creator_name')
                      .find(params[:id])
    
    # SVG処理
    svg_content = get_svg_content(creature)
    is_discovered = current_user ? current_user.discovered?(creature) : false
    
    render json: {
      id: creature.id,
      name: creature.name,
      description: creature.description,
      movement: creature.movement,
      size: creature.size,
      svg_content: svg_content,
      creator_name: creature.creator_name,
      discovered: is_discovered,
      can_discover: current_user.present? && !is_discovered
    }
  end

  private

  def get_svg_content(creature)
    begin
      svg_content = JSON.parse(creature.svg_data)["svg"] if creature.svg_data.present?
    rescue JSON::ParserError
      svg_content = creature.svg_data # 既にSVG文字列の場合
    end
  end
end
