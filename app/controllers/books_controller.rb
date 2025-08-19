class BooksController < ApplicationController
  before_action :require_login

  def index
    @books = current_user.books.includes(:creature => :user)
                        .order(created_at: :desc)
    
    # 統計情報
    @total_discoveries = @books.count
  end
end
