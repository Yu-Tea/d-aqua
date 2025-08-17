Rails.application.routes.draw do
  root "home#index"
  resources :users, only: %i[new create]
  resources :creatures, only: %i[index new create show destroy]
  resources :books, only: %i[index]
  resource :profile, only: %i[show edit update]

  get 'login', to: 'user_sessions#new'
  post 'login', to: 'user_sessions#create'
  delete 'logout', to: 'user_sessions#destroy'

  get '/how_to_play',   to: 'static_pages#how_to_play',   as: :how_to_play
  get '/terms',   to: 'static_pages#terms',   as: :terms
  get '/privacy', to: 'static_pages#privacy', as: :privacy
end
