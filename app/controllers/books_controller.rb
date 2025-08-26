class BooksController < ApplicationController
  before_action :require_login

  def index
    @books = current_user.books.includes(creature: :user).order(created_at: :desc).page(params[:page])

    @discovered_count = current_user.books.count
    @total_creatures_count = Creature.count
  end
end
