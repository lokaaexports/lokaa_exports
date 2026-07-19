# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: homepage.spec.js >> Homepage QA >> loads and captures desktop/mobile screenshots
- Location: tests\live-qa\homepage.spec.js:4:3

# Error details

```
Error: console errors: Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)
Failed to load resource: the server responded with a status of 404 (Not Found)

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 37

- Array []
+ Array [
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+   "Failed to load resource: the server responded with a status of 404 (Not Found)",
+ ]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e4]:
      - link "Lokaa Exports LOKAA Exports · Est. 2026" [ref=e5] [cursor=pointer]:
        - /url: /
        - img "Lokaa Exports" [ref=e7]
        - generic [ref=e8]:
          - generic [ref=e9]: LOKAA
          - generic [ref=e10]: Exports · Est. 2026
      - navigation [ref=e11]:
        - link "Home" [ref=e12] [cursor=pointer]:
          - /url: /
          - text: Home
        - link "About" [ref=e13] [cursor=pointer]:
          - /url: /about
          - text: About
        - link "Process" [ref=e14] [cursor=pointer]:
          - /url: /process
          - text: Process
        - link "AgriOrganicExports" [ref=e15] [cursor=pointer]:
          - /url: /category/organics
          - text: AgriOrganicExports
        - link "Industrial Exports" [ref=e16] [cursor=pointer]:
          - /url: /category/industrial
          - text: Industrial Exports
        - link "All Products" [ref=e17] [cursor=pointer]:
          - /url: /products
          - text: All Products
        - link "RFQnew" [ref=e18] [cursor=pointer]:
          - /url: /rfq
          - text: RFQnew
        - link "Contact" [ref=e19] [cursor=pointer]:
          - /url: /contact
          - text: Contact
      - generic [ref=e20]:
        - link "Login" [ref=e21] [cursor=pointer]:
          - /url: /auth/login
        - link "Register" [ref=e22] [cursor=pointer]:
          - /url: /auth/register
        - link "Request Quote" [ref=e23] [cursor=pointer]:
          - /url: /rfq
          - text: Request Quote
          - img [ref=e25]
      - generic [ref=e28]:
        - link "Request Quote" [ref=e29] [cursor=pointer]:
          - /url: /rfq
          - text: Quote
          - img [ref=e31]
        - button "Menu" [ref=e34]:
          - img [ref=e35]
    - generic [ref=e36]:
      - img "Export cargo and logistics operations" [ref=e37]
      - generic [ref=e38]:
        - generic [ref=e39]:
          - generic [ref=e40]: Premium export house · Chennai, India
          - heading "Connecting the world’s finest supply chains to buyers." [level=1] [ref=e41]
          - paragraph [ref=e42]: Our export house supports importers and procurement teams with dependable sourcing, compliance and delivery for premium agricultural products and industrial machinery.
          - generic [ref=e43]:
            - link "Request a quotation" [ref=e44] [cursor=pointer]:
              - /url: /rfq
              - text: Request a quotation
              - img [ref=e46]
            - link "Explore our export domains" [ref=e49] [cursor=pointer]:
              - /url: /organics
              - text: Explore our export domains
              - img [ref=e50]
        - generic [ref=e53]:
          - generic [ref=e54]:
            - generic [ref=e55]: 42+
            - generic [ref=e56]: destination countries
          - generic [ref=e57]:
            - generic [ref=e58]: "4"
            - generic [ref=e59]: export gateways
          - generic [ref=e60]:
            - generic [ref=e61]: 24h
            - generic [ref=e62]: RFQ response target
          - generic [ref=e63]:
            - generic [ref=e64]: ISO · HACCP · APEDA
            - generic [ref=e65]: compliance framework
    - generic [ref=e67]:
      - generic [ref=e68]:
        - generic [ref=e69]: Specialist sectors
        - heading "Three core export categories, one premium export partner." [level=2] [ref=e70]
        - paragraph [ref=e71]: Each category now operates as a focused sourcing domain while sharing Lokaa’s enterprise service model, quality controls and export execution.
      - generic [ref=e72]:
        - link "Organic exports Organics Certified organic produce, spices, grains, coconut products and specialty ingredients for premium global buyers. View division" [ref=e74] [cursor=pointer]:
          - /url: /category/organics
          - generic [ref=e75]:
            - generic [ref=e76]: Organic exports
            - heading "Organics" [level=3] [ref=e77]
            - paragraph [ref=e78]: Certified organic produce, spices, grains, coconut products and specialty ingredients for premium global buyers.
          - generic [ref=e79]:
            - text: View division
            - img [ref=e81]
        - link "Machinery & electronics Electronic & Machinery Machinery sourcing, industrial automation, electronics and packaging systems for manufacturing and processing plants. View division" [ref=e85] [cursor=pointer]:
          - /url: /category/electronic-machinery
          - generic [ref=e86]:
            - generic [ref=e87]: Machinery & electronics
            - heading "Electronic & Machinery" [level=3] [ref=e88]
            - paragraph [ref=e89]: Machinery sourcing, industrial automation, electronics and packaging systems for manufacturing and processing plants.
          - generic [ref=e90]:
            - text: View division
            - img [ref=e92]
        - link "Other products Others Custom products, services and emerging export categories tailored for bespoke buyer requirements. View division" [ref=e96] [cursor=pointer]:
          - /url: /category/others
          - generic [ref=e97]:
            - generic [ref=e98]: Other products
            - heading "Others" [level=3] [ref=e99]
            - paragraph [ref=e100]: Custom products, services and emerging export categories tailored for bespoke buyer requirements.
          - generic [ref=e101]:
            - text: View division
            - img [ref=e103]
    - generic [ref=e108]:
      - generic [ref=e109]:
        - generic [ref=e110]:
          - generic [ref=e111]: Who we are
          - heading "A global sourcing and export solutions partner built for serious buyers." [level=2] [ref=e112]
          - paragraph [ref=e113]: Lokaa Exports is established to connect international importers with trusted suppliers across India and selected Asian markets through a professional, documented and highly responsive export process.
        - paragraph [ref=e114]: Rather than operating as a marketplace, we coordinate sourcing, quality management, packaging, documentation and logistics through a single trusted point of contact. Our role is to simplify international procurement and make each enquiry feel like a structured business project.
        - generic [ref=e115]:
          - generic [ref=e116]: Strategic product sourcing based on buyer specifications and target-market needs
          - generic [ref=e117]: Supplier qualification, quality coordination and export-ready packaging
          - generic [ref=e118]: Documentation, logistics planning and dedicated commercial support
      - generic [ref=e119]:
        - generic [ref=e120]:
          - generic [ref=e121]: Vision
          - heading "To become one of the world’s most trusted global sourcing and export solution providers." [level=3] [ref=e122]
          - paragraph [ref=e123]: We are building a long-term platform that supports repeat export relationships, premium service standards and future-ready supply chain capability.
        - generic [ref=e124]:
          - generic [ref=e125]: Mission
          - heading "To simplify international sourcing with transparent communication and dependable execution." [level=3] [ref=e126]
          - paragraph [ref=e127]: Our mission is to help buyers source confidently through one reliable partner that can coordinate quality, packaging, documentation and export delivery.
        - generic [ref=e128]:
          - generic [ref=e129]: Future readiness
          - generic [ref=e130]: Private label manufacturingContract manufacturingDedicated warehousingRegional sales officesERP and supply-chain technology
    - generic [ref=e132]:
      - generic [ref=e133]:
        - generic [ref=e134]: How we work
        - heading "A sourcing partner, not an online marketplace." [level=2] [ref=e135]
        - paragraph [ref=e136]: Lokaa Exports manages the commercial and operational flow behind each enquiry so international buyers can focus on growth, not supplier chasing.
      - generic [ref=e137]:
        - generic [ref=e138]:
          - generic [ref=e139]: What this means
          - heading "We coordinate sourcing, verification and export execution for qualified buyers." [level=3] [ref=e140]
          - paragraph [ref=e141]: The website is designed to present a professional export house that supports importers with supplier discovery, product intelligence, documentation and commercial follow-through.
          - link "Start an enquiry" [ref=e142] [cursor=pointer]:
            - /url: /rfq
            - text: Start an enquiry
            - img [ref=e143]
        - generic [ref=e145]:
          - generic [ref=e147]:
            - generic [ref=e148]: "01"
            - heading "Requirement analysis" [level=3] [ref=e149]
            - paragraph [ref=e150]: We review your target market, technical specifications, quantity expectations and compliance priorities.
          - generic [ref=e152]:
            - generic [ref=e153]: "02"
            - heading "Supplier matching" [level=3] [ref=e154]
            - paragraph [ref=e155]: We identify suitable manufacturers, processors and verified supply partners aligned to your brief.
          - generic [ref=e157]:
            - generic [ref=e158]: "03"
            - heading "Quality coordination" [level=3] [ref=e159]
            - paragraph [ref=e160]: Samples, inspections and documentation are managed to reduce risk and support buyer confidence.
          - generic [ref=e162]:
            - generic [ref=e163]: "04"
            - heading "Quotation & export" [level=3] [ref=e164]
            - paragraph [ref=e165]: We prepare a commercial proposal, packaging approach and logistics plan for a smooth export handoff.
    - generic [ref=e167]:
      - generic [ref=e168]:
        - generic [ref=e169]:
          - generic [ref=e170]: Why global buyers choose Lokaa
          - heading "Enterprise-grade sourcing with luxury-grade service." [level=2] [ref=e171]
          - paragraph [ref=e172]: We combine strict quality management, transparent communication and deep export experience to help buyers reduce risk and move faster.
        - generic [ref=e173]:
          - generic [ref=e174]:
            - img [ref=e175]
            - text: Response promise
          - generic [ref=e178]: A formal quotation within 24 hours.
          - paragraph [ref=e179]: Share your requirement, destination, packaging and target price and our desk will return a concise commercial proposal.
      - generic [ref=e180]:
        - generic [ref=e182]:
          - img [ref=e184]
          - heading "Verified origin" [level=3] [ref=e187]
          - paragraph [ref=e188]: Traceability from farm, factory or atelier to the shipment document pack.
        - generic [ref=e190]:
          - img [ref=e192]
          - heading "Compliance-led exports" [level=3] [ref=e197]
          - paragraph [ref=e198]: Documentation support for APEDA, FSSAI, organic certifications, customs and buyer audits.
        - generic [ref=e200]:
          - img [ref=e202]
          - heading "Logistics coordination" [level=3] [ref=e206]
          - paragraph [ref=e207]: Multi-port strategy and partner carrier allocation from Chennai, Mumbai, Kochi and Mundra.
        - generic [ref=e209]:
          - img [ref=e211]
          - heading "Dedicated account support" [level=3] [ref=e213]
          - paragraph [ref=e214]: A senior commercial lead manages pricing, samples, inspection and repeat orders.
    - generic [ref=e216]:
      - generic [ref=e217]:
        - generic [ref=e218]: Export process
        - heading "A disciplined workflow from inquiry to delivery." [level=2] [ref=e219]
        - paragraph [ref=e220]: Global buyers benefit from a procurement process that is transparent, documented and designed for repeat business.
      - generic [ref=e221]:
        - generic [ref=e223]:
          - img [ref=e225]
          - generic [ref=e229]: "01"
          - heading "RFQ intake" [level=3] [ref=e230]
          - paragraph [ref=e231]: Share specifications, destination, target price and estimated volume.
        - generic [ref=e233]:
          - img [ref=e235]
          - generic [ref=e240]: "02"
          - heading "Source & inspect" [level=3] [ref=e241]
          - paragraph [ref=e242]: Approved supplier selection, quality checks and sample coordination.
        - generic [ref=e244]:
          - img [ref=e246]
          - generic [ref=e249]: "03"
          - heading "Document & certify" [level=3] [ref=e250]
          - paragraph [ref=e251]: Commercial invoice, packing list, certificates and destination paperwork.
        - generic [ref=e253]:
          - img [ref=e255]
          - generic [ref=e258]: "04"
          - heading "Load & ship" [level=3] [ref=e259]
          - paragraph [ref=e260]: Container planning, freight coordination and milestone reporting.
    - generic [ref=e262]:
      - generic [ref=e263]:
        - generic [ref=e264]: Industries we serve
        - heading "Trusted by commercial buyers across fast-moving sectors." [level=2] [ref=e265]
        - paragraph [ref=e266]: Our export desk is built for procurement teams that need consistency, speed and full documentation.
      - generic [ref=e267]:
        - generic [ref=e270]:
          - heading "Food & beverage" [level=3] [ref=e271]
          - img [ref=e272]
        - generic [ref=e276]:
          - heading "Retail & distribution" [level=3] [ref=e277]
          - img [ref=e278]
        - generic [ref=e282]:
          - heading "Hospitality & HoReCa" [level=3] [ref=e283]
          - img [ref=e284]
        - generic [ref=e288]:
          - heading "Private-label brands" [level=3] [ref=e289]
          - img [ref=e290]
        - generic [ref=e294]:
          - heading "Industrial procurement" [level=3] [ref=e295]
          - img [ref=e296]
        - generic [ref=e300]:
          - heading "Government tenders" [level=3] [ref=e301]
          - img [ref=e302]
    - generic [ref=e307]:
      - generic [ref=e308]:
        - generic [ref=e309]: Global reach
        - heading "A multi-port network for dependable freight planning." [level=2] [ref=e310]
        - paragraph [ref=e311]: We coordinate sourcing and delivery across 42+ countries with a strategic export footprint in India.
      - generic [ref=e312]:
        - generic [ref=e313]:
          - generic [ref=e314]: 42+
          - generic [ref=e315]: Destination countries
        - generic [ref=e316]:
          - generic [ref=e317]: "4"
          - generic [ref=e318]: Indian export gateways
        - generic [ref=e319]:
          - generic [ref=e320]: 24h
          - generic [ref=e321]: Quotation target
        - generic [ref=e322]:
          - generic [ref=e323]: 100%
          - generic [ref=e324]: Document-ready shipments
    - generic [ref=e326]:
      - generic [ref=e327]:
        - generic [ref=e328]: Certifications & compliance
        - heading "Credentials that support buyer confidence." [level=2] [ref=e329]
        - paragraph [ref=e330]: Our documentation and quality framework is aligned to requesting markets, inspections and retailer audit requirements.
      - generic [ref=e331]:
        - generic [ref=e333]: APEDA
        - generic [ref=e335]: ISO 22000
        - generic [ref=e337]: HACCP
        - generic [ref=e339]: USDA Organic
        - generic [ref=e341]: EU Organic
        - generic [ref=e343]: FIEO
        - generic [ref=e345]: Spices Board
        - generic [ref=e347]: BRC
    - generic [ref=e349]:
      - generic [ref=e350]:
        - generic [ref=e351]: Customer success stories
        - heading "Buyers trust Lokaa for repeat orders and smooth execution." [level=2] [ref=e352]
        - paragraph [ref=e353]: We are privileged to support importers who need reliability at scale.
      - generic [ref=e354]:
        - generic [ref=e356]:
          - generic [ref=e357]:
            - img [ref=e358]
            - img [ref=e361]
            - img [ref=e364]
            - img [ref=e367]
            - img [ref=e370]
          - paragraph [ref=e373]: “Lokaa handled our organic spice import program with accuracy, speed and very strong communication. We now treat them as a strategic partner.”
          - generic [ref=e374]:
            - generic [ref=e375]: A. Rahman
            - generic [ref=e376]: Procurement Director, Dubai
        - generic [ref=e378]:
          - generic [ref=e379]:
            - img [ref=e380]
            - img [ref=e383]
            - img [ref=e386]
            - img [ref=e389]
            - img [ref=e392]
          - paragraph [ref=e395]: “Their compliance documentation made our audit process simple. The commercial team was responsive and professional from first inquiry to shipment.”
          - generic [ref=e396]:
            - generic [ref=e397]: M. Chen
            - generic [ref=e398]: Import Manager, Singapore
    - generic [ref=e400]:
      - generic [ref=e401]:
        - generic [ref=e402]: Frequently asked questions
        - heading "Common questions from importers and procurement teams." [level=2] [ref=e403]
      - generic [ref=e404]:
        - group [ref=e405]:
          - generic "Do you support small and large volume orders?" [ref=e406]
        - group [ref=e407]:
          - generic "Can you support private-label and packaging requirements?" [ref=e408]
        - group [ref=e409]:
          - generic "What information should I send for an RFQ?" [ref=e410]
    - generic [ref=e412]:
      - generic [ref=e413]:
        - generic [ref=e414]:
          - generic [ref=e415]: Latest insights
          - heading "Market perspectives for buyers and sourcing teams." [level=2] [ref=e416]
        - link "Explore our organic domain" [ref=e417] [cursor=pointer]:
          - /url: /organics
          - text: Explore our organic domain
          - img [ref=e418]
      - generic [ref=e420]:
        - generic [ref=e422]:
          - generic [ref=e423]: Resource
          - heading "How importers evaluate premium export partners" [level=3] [ref=e424]
          - paragraph [ref=e425]: A practical guide for procurement teams reviewing supplier quality, compliance and response speed.
          - link "Discuss your requirement" [ref=e426] [cursor=pointer]:
            - /url: /rfq
            - text: Discuss your requirement
            - img [ref=e427]
        - generic [ref=e430]:
          - generic [ref=e431]: Resource
          - heading "Organic sourcing trends for global buyers" [level=3] [ref=e432]
          - paragraph [ref=e433]: What buyers are looking for in certification, traceability and seasonal availability.
          - link "Discuss your requirement" [ref=e434] [cursor=pointer]:
            - /url: /rfq
            - text: Discuss your requirement
            - img [ref=e435]
    - generic [ref=e441]:
      - generic [ref=e442]:
        - generic [ref=e443]: Start sourcing
        - heading "Let our export desk prepare a premium proposal for your next shipment." [level=2] [ref=e444]
        - paragraph [ref=e445]: From product selection to freight planning, we help procurement teams move quickly without compromising on quality.
      - generic [ref=e446]:
        - link "Request quote" [ref=e447] [cursor=pointer]:
          - /url: /rfq
        - link "Call our desk" [ref=e448] [cursor=pointer]:
          - /url: tel:+919790607059
          - text: Call our desk
          - img [ref=e449]
    - generic [ref=e452]:
      - generic [ref=e453]:
        - generic [ref=e454]:
          - generic [ref=e455]:
            - img "Lokaa Exports" [ref=e456]
            - generic [ref=e457]:
              - generic [ref=e458]: LOKAA
              - generic [ref=e459]: Exports
          - paragraph [ref=e460]: Connecting India’s finest products to global markets.
          - generic [ref=e461]:
            - generic [ref=e462]:
              - img [ref=e463]
              - text: info@lokaaexports.com
            - generic [ref=e466]:
              - img [ref=e467]
              - text: +91 97906 07059
            - generic [ref=e469]:
              - img [ref=e470]
              - text: Chennai
        - generic [ref=e473]:
          - generic [ref=e474]: Explore
          - list [ref=e475]:
            - listitem [ref=e476]:
              - link "Home" [ref=e477] [cursor=pointer]:
                - /url: /
            - listitem [ref=e478]:
              - link "About" [ref=e479] [cursor=pointer]:
                - /url: /about
            - listitem [ref=e480]:
              - link "Process" [ref=e481] [cursor=pointer]:
                - /url: /process
            - listitem [ref=e482]:
              - link "AgriOrganicExports" [ref=e483] [cursor=pointer]:
                - /url: /organics
            - listitem [ref=e484]:
              - link "Industrial Exports" [ref=e485] [cursor=pointer]:
                - /url: /industrial
            - listitem [ref=e486]:
              - link "Contact" [ref=e487] [cursor=pointer]:
                - /url: /contact
        - generic [ref=e488]:
          - generic [ref=e489]: Specialties
          - list [ref=e490]:
            - listitem [ref=e491]:
              - link "Seasonal organics" [ref=e492] [cursor=pointer]:
                - /url: /organics
            - listitem [ref=e493]:
              - link "Non-seasonal organics" [ref=e494] [cursor=pointer]:
                - /url: /organics
            - listitem [ref=e495]:
              - link "Machinery sourcing" [ref=e496] [cursor=pointer]:
                - /url: /industrial
            - listitem [ref=e497]:
              - link "Industrial equipment" [ref=e498] [cursor=pointer]:
                - /url: /industrial
        - generic [ref=e499]:
          - generic [ref=e500]: Start Sourcing
          - paragraph [ref=e501]: Receive a tailored proposal within 24 hours from our export desk.
          - link "Request Quote" [ref=e502] [cursor=pointer]:
            - /url: /rfq
            - text: Request Quote
            - img [ref=e504]
      - generic [ref=e507]:
        - generic [ref=e508]: © 2026 LOKAA. All rights reserved.
        - generic [ref=e509]:
          - text: APEDA · FIEO · Spices Board of India · ISO 22000
          - link "Admin login" [ref=e511] [cursor=pointer]:
            - /url: /admin/login
            - img [ref=e512]
            - text: Admin login
    - link "WhatsApp" [ref=e515] [cursor=pointer]:
      - /url: https://wa.me/919790607059
      - img [ref=e516]
      - text: WhatsApp
    - link "Skip to content" [ref=e518] [cursor=pointer]:
      - /url: "#top"
  - region "Notifications alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Homepage QA', () => {
  4  |   test('loads and captures desktop/mobile screenshots', async ({ page }) => {
  5  |     test.setTimeout(60000)
  6  |     const consoleErrors = []
  7  |     const failedRequests = []
  8  | 
  9  |     page.on('console', (msg) => {
  10 |       if (msg.type() === 'error') consoleErrors.push(msg.text())
  11 |     })
  12 |     page.on('requestfailed', (req) => {
  13 |       failedRequests.push(`${req.method()} ${req.url()} :: ${req.failure()?.errorText || 'failed'}`)
  14 |     })
  15 | 
  16 |     await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })
  17 |     await expect(page).toHaveURL(/\/$/)
  18 |     await expect(page.locator('body')).toBeVisible()
  19 |     await page.screenshot({ path: 'artifacts/homepage-desktop.png', fullPage: true })
  20 | 
  21 |     await page.setViewportSize({ width: 390, height: 844 })
  22 |     await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 })
  23 |     await page.screenshot({ path: 'artifacts/homepage-mobile.png', fullPage: true })
  24 | 
> 25 |     expect(consoleErrors, `console errors: ${consoleErrors.join('\n')}`).toEqual([])
     |                                                                          ^ Error: console errors: Failed to load resource: the server responded with a status of 404 (Not Found)
  26 |     expect(failedRequests, `failed requests: ${failedRequests.join('\n')}`).toEqual([])
  27 |   })
  28 | })
  29 | 
```