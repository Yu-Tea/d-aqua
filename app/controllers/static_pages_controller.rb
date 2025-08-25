class StaticPagesController < ApplicationController
  skip_before_action :require_login
  def how_to_play; end

  def terms; end

  def privacy; end
end
