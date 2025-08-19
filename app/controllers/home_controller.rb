class HomeController < ApplicationController
  skip_before_action :require_login, only: %i[index]

  def index
    @current_user = current_user
    @discovered_creature_ids = @current_user&.books&.pluck(:creature_id) || []
  end
end
