# Squarespace/WordPress XML Export Structure

File: `export-2026-03-09.xml`
Format: WordPress eXtended RSS (WXR) 1.2

## Namespaces

| Prefix | URI |
|--------|-----|
| `wp` | `http://wordpress.org/export/1.2/` |
| `content` | `http://purl.org/rss/1.0/modules/content/` |
| `excerpt` | `http://wordpress.org/export/1.2/excerpt/` |
| `dc` | `http://purl.org/dc/elements/1.1/` |
| `wfw` | `http://wellformedweb.org/CommentAPI/` |

## Channel-level fields

```xml
<channel>
  <title>Hans Majestet den Gyldne Gris</title>
  <link>http://hmgrisen.com</link>
  <pubDate>...</pubDate>
  <description>...</description>
  <language>en-US</language>
  <wp:wxr_version>1.2</wp:wxr_version>

  <!-- Repeated per author -->
  <wp:author>
    <wp:author_id>-895703501</wp:author_id>
    <wp:author_login>kyrreal@yahoo.com</wp:author_login>  <!-- used as dc:creator -->
    <wp:author_email>kyrreal@yahoo.com</wp:author_email>
    <wp:author_display_name><![CDATA[Kyrre Alvaer]]></wp:author_display_name>
    <wp:author_first_name><![CDATA[Kyrre]]></wp:author_first_name>
    <wp:author_last_name><![CDATA[Alvaer]]></wp:author_last_name>
  </wp:author>

  <!-- Repeated per taxonomy category -->
  <wp:category>
    <wp:cat_name><![CDATA[Non-Profit - null]]></wp:cat_name>
    <wp:category_nicename>Non-Profit-null</wp:category_nicename>
    <wp:category_parent />
  </wp:category>

  <!-- Items (posts, pages, attachments) -->
  <item>...</item>
</channel>
```

## Item counts

| `wp:post_type` | Count |
|----------------|-------|
| `post`         | 48    |
| `page`         | 29    |
| `attachment`   | 119   |
| **Total**      | **196** |

## Item fields (posts and pages)

```xml
<item>
  <title>Nye riddere, kommandører og Storkors</title>

  <!-- Old permalink — RELATIVE path for posts/pages, full CDN URL for attachments -->
  <link>/nyheter/2013/10/6/nye-riddere-kommandrer-og-storkors</link>

  <!-- Full HTML content, CDATA-wrapped, may contain WP shortcodes and Squarespace divs -->
  <content:encoded><![CDATA[...]]></content:encoded>

  <!-- Usually empty for Squarespace exports -->
  <excerpt:encoded />

  <!-- URL slug / path, e.g. "2013/10/6/some-slug" for posts, "about" for pages -->
  <wp:post_name>2013/10/6/nye-riddere-kommandrer-og-storkors</wp:post_name>

  <wp:post_type>post</wp:post_type>   <!-- post | page | attachment -->
  <wp:post_id>0</wp:post_id>
  <wp:status>publish</wp:status>      <!-- publish | draft | inherit -->
  <pubDate>Sun, 06 Oct 2013 18:41:12 +0000</pubDate>
  <wp:post_date>2013-10-06 18:41:12</wp:post_date>
  <wp:post_date_gmt>2013-10-06 18:41:12</wp:post_date_gmt>
  <dc:creator>kyrreal@yahoo.com</dc:creator>  <!-- matches wp:author_login -->
  <wp:comment_status>open</wp:comment_status>

  <!-- Optional metadata pairs -->
  <wp:postmeta>
    <wp:meta_key>_thumbnail_id</wp:meta_key>
    <wp:meta_value><![CDATA[1]]></wp:meta_value>
  </wp:postmeta>
</item>
```

## Item fields (attachments)

```xml
<item>
  <!-- Full CDN URL in both link and attachment_url for attachments -->
  <wp:attachment_url>http://images.squarespace-cdn.com/content/v1/SITE_ID/HASH/FILENAME.ext</wp:attachment_url>
  <link>http://images.squarespace-cdn.com/...</link>
  <title>attachment-SQUARESPACE_ID</title>
  <wp:post_name>filename-without-ext</wp:post_name>
  <wp:post_type>attachment</wp:post_type>
  <wp:post_id>54</wp:post_id>
  <wp:post_parent>53</wp:post_parent>   <!-- ID of the owning post/page -->
  <wp:status>inherit</wp:status>
  <!-- content:encoded and excerpt:encoded contain Squarespace internal IDs, not useful -->
</item>
```

## HTML content quirks

### Squarespace wrapper divs
Content is often wrapped in one of these and can be safely unwrapped:
```html
<div class="sqs-html-content" data-sqsp-text-block-content>...</div>
<div class="image-gallery-wrapper">...</div>
```

### WordPress `[caption]` shortcodes
Images with captions use WP shortcode syntax embedded in the HTML:
```
[caption id="" align="alignnone" width="1000"]
  <img src="https://images.squarespace-cdn.com/..." alt="Alt text"/>
  Caption text here
[/caption]
```
These need to be pre-processed before HTML-to-Markdown conversion.

## Image URLs

All images are hosted on Squarespace CDN:
```
https://images.squarespace-cdn.com/content/v1/SITE_ID/HASH/FILENAME.ext?format=original
```

- `SITE_ID` is always `512b26c8e4b091ea7fc94ac7` for this export
- The same image may appear with different query strings — deduplicate by URL without query
- The filename segment (last path component) is generally a good local filename
- 394 unique image URLs found across all content
