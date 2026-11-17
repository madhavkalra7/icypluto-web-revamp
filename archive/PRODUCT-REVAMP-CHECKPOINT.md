# Product-led revamp checkpoint

The current redesign is uncommitted on `madhav` and can be discarded independently of the earlier design work.

`before-product-revamp-2026-11-11.zip` contains the complete prior `src/`, `public/`, homepage, build configuration, package files, and README. It includes the most recent hero transition fix, which was already uncommitted before this redesign. Each saved file has a SHA-256 entry in `checkpoint-manifest.json` inside the ZIP.

The revised experience introduces:

- A product-led hero and optional orbital exploration; ordinary scrolling proceeds into the product.
- Archivo variable typography, self-hosted under its Open Font License.
- A four-step sample report with fictional brands, illustrative responses, internally consistent mention counts, source exploration, and connected tools.
- Audience, methodology/limits, pricing inquiry, community, FAQs, and specific walkthrough calls to action.
- Four static capability pages and an About page, built as real HTML entry points.
- Shared navigation/contact components and consistent light/dark presentation.

To discard, restore the saved files from this ZIP to the same checkout, then review and remove only the new files listed in `product-revamp-created-files.json`. Do not use a blanket Git reset: the checkpoint includes pre-existing working changes. The rollback is intentionally not run automatically.

The demo does not call an AI service, analyze a visitor's website, invent customer evidence, or present synthetic example data as live results. Pricing and model availability are confirmed through the existing demo/contact flow. The existing email-preparation form remains explicit about not sending anything automatically.
