class HomeController < ApplicationController
  skip_before_action :require_login, only: %i[index]

  def index
    # 各movementタイプ別にランダムで1匹ずつ取得
    @swim_creatures = Creature.swim.limit(4)
    @float_creatures = Creature.float.limit(4)
    @rest_creatures = Creature.rest.limit(4)
    
    # ログイン状態の確認
    @current_user = current_user
    @discovered_creature_ids = @current_user&.books&.pluck(:creature_id) || []
  end
end
