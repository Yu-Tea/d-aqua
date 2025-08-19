class Api::V1::BaseController < ApplicationController
  # API共通の設定
  skip_before_action :verify_authenticity_token
  
  rescue_from ActiveRecord::RecordNotFound do |exception|
    render json: { error: 'Record not found' }, status: 404
  end
  
  rescue_from StandardError do |exception|
    render json: { error: 'Internal server error' }, status: 500
  end
end