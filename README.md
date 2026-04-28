                                                Zed-NRC-Validator

## Problem Statement
    This prototype app helps developers, individuals or anyone of interest to validate NRC's and generates sample NRC's for testing purposes in the event of user identification if given permission from legal authorities.

## What this does
    Zambia's NRC use a district code that has two digits, one for the province(1-9) and the other for the district within the province. It shall accept string input and validate it against the Zambian NRC format(Level 1)
    In strict Mode(Level 2) Newly developed districts will maintain their Original province codes e.g Muchinga districts will be validated using their original province codes

## The Architecture
    Layer 1- pure logic /src/lib/nrc.ts
    Layer 2- API routes /src/app/api/
    Layer 3- UI /src/app/page.tsx

## Known Limitations
    The strict mode becomes a major limitation as it does not validate newly developed districts with their own individual codes but rather maintain the codes of the original codes of the province.

## How To setup
 First run the development server:
 '''bash 
 npm run dev
 # or
 yarn dev
 # or 
 pnpm dev
 # or 
 bun dev

 open [http://localhost:3000](http://localhost:3000) with your browser to see the results.

 ## Stack
 Next.js,typescript,Node and varcel for deployment
