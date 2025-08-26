class Api::V1::CreaturesController < Api::V1::BaseController
  skip_before_action :require_login

  def show; end
  
  def random
    # movementパラメータの処理を改善
    movement_param = params[:movement] || [ "swim", "float", "rest" ].sample
    # enumの数値に変換
    movement_value = Creature.movements[movement_param]

    # ユーザー名を取得させる
    base_query = Creature.joins(:user)
                      .select("creatures.*, users.name as creator_name")
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
        can_discover: current_user.present? && !is_discovered,
        twitter_share_url: twitter_share_url_for_creature(creature),
      }
    else
      render json: { error: "生き物が見つかりませんでした" }, status: 404
    end
  end

  # 生き物発見用のエンドポイント
  def discover
    creature = Creature.find(params[:id])

    book = current_user.books.find_or_create_by(creature: creature) do |new_book|
    end

    # DBに保存済みかチェック
    if book.persisted?
      # ヘッダー図鑑ボタン用のカウント情報
      discovered_count = current_user.books.count
      total_creatures_count = Creature.count

      # オブジェクトが直前の保存でデータベースに新規作成されたらtrue
      if book.previously_new_record?
        # 発見成功
        render json: {
        success: true,
        is_new_discovery: true,
        # カウント情報を追加
        discovered_count: discovered_count,
        total_creatures_count: total_creatures_count
      }
      else
        # すでに発見済み
        render json: {
        success: true,
        is_new_discovery: false,
        # カウント情報を追加（変化なしでも一貫性のため）
        discovered_count: discovered_count,
        total_creatures_count: total_creatures_count
      }
      end
    else
      render json: { success: false, error: book.errors.full_messages.join(", ") }
    end
    rescue ActiveRecord::RecordNotFound
      render json: { success: false, error: "生き物が見つかりません" }, status: 404
    rescue => e
      render json: { success: false, error: "発見処理中にエラーが発生しました" }
  end

  private

  def get_svg_content(creature)
    begin
      svg_content = JSON.parse(creature.svg_data)["svg"] if creature.svg_data.present?
    rescue JSON::ParserError
      svg_content = creature.svg_data # 既にSVG文字列の場合
    end
  end

  def twitter_share_url_for_creature(creature)
    share_text = "『#{creature.name}』に出会ったよ！ #DAYDREAM_AQUARIUM\n"
    encoded_text = URI.encode_www_form_component(share_text)
    encoded_url = URI.encode_www_form_component(creature_url(creature))
    
    "https://twitter.com/share?url=#{encoded_url}&text=#{encoded_text}"
  end
end
