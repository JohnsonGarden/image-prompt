# Image Prompt v0.1 · Product Spec

Status: implemented MVP / 2026-10-28.

## Product promise

Make prompt iteration more structured and repeatable for one person who uses ChatGPT Plus to create and edit images, with **zero additional paid image API dependency**. Optimize prompt instructions for GPT Images 2.5 use cases without claiming to control the model chosen by ChatGPT.

## Primary user story

As a frequent portrait/photo editor, I choose a scenario template, express which visual properties may change or must be preserved, generate a clear copy-ready prompt, manually submit it with reference pictures in ChatGPT, and return to edit or save that prompt later.

## v0.1 acceptance criteria

| ID | Scenario | Result |
|----|----------|--------|
| P-01 | Choose a starter template | All editing fields reflect the selected template. |
| P-02 | Change subject, scene or camera | Prompt updates immediately with structured readable sections. |
| P-03 | Toggle identity, body, environment and skin constraints | Constraints appear/disappear deterministically; default compiler warns when relevant references are not declared. |
| P-04 | Describe up to six references and assign roles | Prompt identifies each numbered reference and its role; no images are uploaded by this app. |
| P-05 | Use no API Key and copy | Full prompt can be copied and pasted into ChatGPT; ChatGPT opens separately. |
| P-06 | Save to browser, reload, reopen or delete | Valid project data persists in local storage and can be restored without account or network. |
| P-07 | Storage is broken or unavailable | App starts without crashing; a failed save produces feedback. |
| P-08 | Required subject is empty | No invalid prompt is copied, and save is disabled. |
| P-09 | On a small screen | Builder, reference role controls, local projects and copy action remain accessible. |

## Out of scope

Automated image generation; API Key management; OAuth; prompts that guarantee identity consistency; model routing; cloud persistence; reference image uploads; collecting third-party template libraries without auditing rights; provider-specific unofficial endpoints.

## Known limitations

- Copy requires Clipboard API access. Fallback instruction guides user to select the prompt manually.
- Browser localStorage is not a durable backup, cross-device sync, or a secure vault.
- Ref roles are *declarations*; the user must select corresponding reference files in ChatGPT.
- Quality and ratio instructions are preferences; they do not override provider capability controls.
- Six initial templates support product validation; 20 curated templates are planned for a later milestone.

## Success signal for next increment

Complete a start-to-finish portrait identity-preservation iteration without writing an unstructured prompt from scratch. Conduct manual checks on template switching, all toggles, save/load/delete, mobile controls, and clipboard behavior; do not claim image-generation accuracy before actual image A/B evaluations.
