module CreaturesHelper
  def twitter_share_url(creature)
    base_text = twitter_share_text(creature)
    encoded_text = URI.encode_www_form_component(base_text)
    encoded_url = URI.encode_www_form_component(request.url)
    
    "https://twitter.com/share?url=#{encoded_url}&text=#{encoded_text}"
  end

  private

  def twitter_share_text(creature)
    action = current_user == creature.user ? 'ソウゾウ' : '発見'
    "『#{creature.name}』を#{action}したよ！ #DAYDREAM_AQUARIUM\n"
  end
end
