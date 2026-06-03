# First-Page LaTeX Setup

Use this setup for each paper subfolder:

- `paper.pdf`: original source paper.
- `figure.png`: first-page figure image.
- `deepprior-logo.png`: original square DeepPrior logo, not cropped.
- `deepprior.tex`: ICLR-template-based first-page source.
- `deepprior.pdf`: generated one-page preview PDF.

Layout choices:

- Logo: original square image, `width=0.825in`, `keepaspectratio`, placed as a standalone top-right page overlay. Use `\put(\LenToUnit{8.10in},\LenToUnit{-1.23in})` so the logo's top-to-page and right-to-page distances are approximately equal.
- Title: centered, bold, `\LARGE`, NeurIPS-like title treatment.
- Authors: bold rows, centered; wrap manually when a row is too long.
- Affiliations: centered footnote-size rows below the author rows.
- Abstract: centered `\large\sc Abstract` label and quoted body.
- Figure: full content-frame width using `width=\textwidth, keepaspectratio`; it is the last block in a fixed-height first-page minipage, so its caption lands at the bottom. Use `\vspace*{0.50in}` below the overlay logo and `\vfill` between title, authors, abstract, and figure so the vertical gaps distribute evenly.
