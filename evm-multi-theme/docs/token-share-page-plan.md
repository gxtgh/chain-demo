# Token Share Page Plan

## Status

This is a product plan only. Do not implement it yet.

## Goal

After a user creates a token successfully, provide a lightweight sharing flow that lets the user generate and share a token poster and token profile link. The first version should focus on speed and clarity, without referral links, UTM parameters, attribution tracking, or analytics.

## Core Flow

1. User creates a standard token or tax token successfully.
2. Success state shows a `Share My Token` action.
3. Clicking the action navigates to a custom token sharing page.
4. The share page receives the token context through URL parameters.
5. The share page renders a token poster with token information and Web3 Token platform branding.
6. The user can copy the share link, copy the token address, download the poster, or open the token in the block explorer.

## URL Parameters

Required:

- `chain`
- `tokenAddress`

Optional:

- `txHash`

Not included in the first version:

- `ref`
- `utm_source`
- `utm_campaign`
- referral codes
- conversion tracking parameters

## Share Page Content

The share page should auto-read on-chain token metadata when possible:

- token name
- token symbol
- token decimals

If metadata lookup fails, allow the user to manually fill or adjust:

- display title
- token name
- token symbol
- short project description
- project logo or avatar
- website link
- community link
- poster theme color

## Token Poster

The generated poster should include:

- chain name
- token name
- token symbol
- token address
- block explorer QR code or share page QR code
- Web3 Token logo
- platform mark such as `Created with Web3 Token`
- product key message, for example `Create your token across EVM chains`

## Right-Side Share Panel

Add a right-side share action area on the share page:

- copy share page link
- copy token address
- download poster
- open block explorer

This panel should be easy to access on desktop. On mobile, it can become a sticky bottom action bar.

## Success Actions

After token creation, show quick follow-up actions:

- `Share My Token`
- `Add to Wallet`
- `Open Explorer`

`Add to Wallet` should use `wallet_watchAsset` where supported and pass token address, symbol, decimals, and logo when available.

## Future Follow-Up Actions

Keep these as future extension points. They should not block the first version:

- create liquidity
- lock LP
- token vesting
- airdrop
- multisender
- token profile metadata submission

## Out of Scope For First Version

- referral tracking
- UTM tracking
- analytics events
- invite rewards
- affiliate commissions
- dynamic OG image generation
- server-side token registry
- liquidity creation
- LP locking
- vesting
- airdrop

## Product Principle

The share page should not be only a poster generator. It should become a lightweight token project card: the poster helps distribution, while the page helps viewers trust the token context and take the next action.
