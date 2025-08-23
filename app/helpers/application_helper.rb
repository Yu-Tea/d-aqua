module ApplicationHelper
  def flash_background_color(type)
    case type.to_sym
    when :notice then "bg-emerald-300"
    when :danger  then "bg-red-400"
    when :error  then "bg-yellow-500"
    else "bg-sky-500"
    end
  end

  def page_title(title = "")
    base_title = "DAYDREAM AQUARIUM"
    title.present? ? "#{title} | #{base_title}" : base_title
  end
end
