Rails.application.routes.draw do
  root "home#index"
  resources :users, only: %i[new create]
  resources :creatures, only: %i[index new create show destroy]
  resources :books, only: %i[index]

  get 'login', to: 'user_sessions#new'
  post 'login', to: 'user_sessions#create'
  delete 'logout', to: 'user_sessions#destroy'
end
