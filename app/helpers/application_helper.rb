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

  def default_meta_tags
    {
      description: "当館はアナタや誰かがソウゾウしたイキモノが住まう空想水族館です。",
      canonical: request.original_url,
      og: {
        title: :title,
        type: "website",
        url: request.original_url,
        image: image_url("ogp.png"),
        site_name: "DAYDREAM AQUARIUM",
        description: :description,
      },
      twitter: {
        card: "summary_large_image",
        site: "@Yu_Tea_68",
      }
    }
  end
end
