# Lacquer Library

A nail polish library and Instagram caption helper. Keep track of the polishes you own, tick the ones you used in a set, and get a ready-to-paste caption that tags each brand's Instagram account.

**Use it here:** https://mahi-p22.github.io/lacquer-library/

## What it does

- **Library.** Add polishes by hand, or pick them from a built-in list of popular shades from OPI, Essie, Chanel, CND, Holo Taco and more. For brands that name shades by number (like Modelones), search the brand and tap "Add your own" to add a shade by its number. Each one shows as a little bottle in its colour.
- **New post.** Tap the polishes in your set, describe it in a few words, choose a style (trendy, cute, minimal, funny or detailed) and get a caption with the polish list, brand @tags, your handle and your hashtags. Copy it and paste it into Instagram.
- **Trends.** Seasonal trend ideas with caption lines, hashtags, "See examples" links to TikTok, Instagram and Pinterest, and a spot to save your own inspo links and screenshots. It opens on the season that matches today's date.
- **Settings.** Your handle, default hashtags, sign-off, brand @tags (editable), and a backup file you can download and restore.

## Where your data lives

Everything is saved in your own browser on your own device. Nothing is uploaded anywhere. That also means a different phone or browser starts empty: use **Settings → Download backup** and **Restore from backup** to move your library.

## Optional AI helper (off by default)

If you have your own Anthropic API key, you can turn on the AI helper in Settings. It then writes captions with AI (it can look at your nail photo), suggests shades for brands that aren't in the built-in list, and comes up with fresh trend ideas. The key is stored only in your browser and is sent only to Anthropic. Use costs a small amount on your Anthropic account.

## Changing things

The site is plain HTML, CSS and JavaScript with no build step.

| File | What's in it |
| --- | --- |
| `index.html` | The page layout |
| `styles.css` | Colours, fonts and the bottle icons |
| `app.js` | How everything works |
| `catalog.js` | The built-in shade list (add brands or shades here) |
| `trends.js` | The seasonal trend packs and posting tips |

Edit a file on GitHub and save (commit) it, and the live site updates within a minute or two.
