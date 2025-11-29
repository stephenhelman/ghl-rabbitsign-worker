# 🧩 Tenant Onboarding Checklist

## For GHL → RabbitSign → Automation Platform

This checklist walks you (or your client) through every required step to onboard a new tenant into your automation system.

---

# ✅ 1. Create Required Accounts

## **1.1 RabbitSign**

- Create an account: https://rabbitsign.com
- Go to **Developer > API Keys**
- Copy the following:
  - `RABBIT_KEY_ID`
  - `RABBIT_SECRET_KEY`
- Add a Webhook
  - https://operation-profit-worker.operationprofitllc.workers.dev/tenant/{YOUR_TENANT_ID}/webhooks/rabbitsign

### **1.2 GoHighLevel**

- Ensure the client has Admin access
- Navigate to:
  - **Settings → Teams → API Keys**
  - Copy the **"Location API Key"** (not the user key)
- Confirm the following API scopes are enabled:
  - Contacts
  - Opportunities
  - Pipelines
  - Custom Fields
  - Workflows & Webhooks (if needed)

---

# ✅ 2. Prepare Required GHL Assets

### **2.1 Pipelines**

Your automations require **three pipeline stages**:

- `contractSent`
- `sellerSigned`
- `fullySigned`

Record these three:

- **Pipeline ID**
- **Stage ID (contractSent)**
- **Stage ID (sellerSigned)**
- **Stage ID (fullySigned)**

You can retrieve IDs from:

- Settings → Pipelines → Right-click → Inspect JSON  
  (or use your existing GHL lookup endpoint)

---

# ✅ 3. Configure Workflow Webhooks in GHL

## **3.1 Prefill Trigger**

Create a workflow that triggers when opportunity stage = _Contract Sent_  
Add a Webhook step:

**POST**  
https://operation-profit-worker.operationprofitllc.workers.dev/tenant/{YOUR_TENANT_ID}/prefill/{YOUR_CONTRACT_TYPE}

Send **Full Opportunity Data** + **Custom Data**.

## **3.2 Stage Update Trigger**

Another workflow for stage changes:

- Add a custom notification letting you know that the client has signed

# ✅ 4. Create Template Config Entries (Per Contract Type)

Each contract (cash, subto, sellerFinance, etc.) must be configured.

Use Postman Admin Route:

**POST**
https://<BACKEND_URL>/admin/template-config

Sample payload:

```
{
  "tenantId": <YOUR_TEMPLATE_ID>,
  "contractType": <CONTRACT_TYPE>,
  "rabbitTemplateId": "<TEMPLATE_ID_FROM_RABBITSIGN>",
  "displayName": <TEMPLATE_NAME>,
  "version": 1,
  "senderFieldMap": [
    { "fieldId": <RABBITSIGN_FIELD_ID>, "source": <CTX_MAPPING> },
    {<ETC>}
  ],
  "roles": [
    { "roleKey": <RABBTISIGN_ROLE>, "emailSource": <CTX_MAP_EMAIL>, "nameSource": <CTX_MAP_NAME> },
    { <ETC> }
  ],
  "ctxMapping": {<MAPPING_FOR_CTX_OBJ>}
}
```

# ✅ 5. Create Template Config Entries (Per Contract Type)

Use Admin Postman Route

https://<BACKEND_URL>/admin/tenants

Payload Example:

```
{
  "tenantId": <TENANT_ID>,
  "name": <TENANT_NAME>,
  "ghlLocationId": "<client_location_id>",
  "ghlApiKey": "<PLAINTEXT_location_api_key>",
  "rabbitKeyId": "<PLAINTEXT_rabbit_key_id>",
  "rabbitSecretKey": "<PLAINTEXT_rabbit_secret_key>",
  "defaultPipelineId": "<PIPELINE_ID>",
  "stageIds": {
    "contractSent": "<STAGE_ID>",
    "sellerSigned": "<STAGE_ID>",
    "fullySigned": "<STAGE_ID>"
  }
}

```

Backend encrypts all sensitive keys automatically.

# 6. Configure Worker Secrets

In `.dev.vars` or Cloudflare Secrets:

SERVER_URL=https://<your-server-url>
SERVER_ADMIN_TOKEN=<YOUR_ADMIN_TOKEN>

Then deploy worker:

wrangler publish

# 7. Prefill Test (Required)

POST
https://<your-worker-url>/<tenantId>/prefill

Use a sample payload exported from GHL workflow test panel.

Verify:

- Server receives context
- RabbitSign folder is created
- Opportunity moves to "Contract Sent"
- Worker returns 200 OK

# 8. Stage Update Tests

Inside GHL:

1. Manually move opportunity → Seller Signed
2. Then → Fully Signed

Confirm:

- Server receives updates
- Worker receives callbacks (if applicable)
- No webhook retries

# 9. Full E2E Test (Before Onboarding Client)

Run a full live cycle:

1. Trigger workflow → prefill
2. Verify RabbitSign folder creation
3. Sign seller side
4. Sign buyer side (if applicable)
5. Confirm:
   - Stage updates work
   - Final stage callback works
   - Logs appear on server
   - No retries from RabbitSign
   - Custom object creation (if enabled)

# 10. Optional Enhancements

## 10.1 Custom Objects

Set up:

- Signed Documents object
- Associations (Contact → Custom Object)
- Mapping rules per tenant

## 10.2 Notes Splitting

If contract requires multiple notes fields:

Use:

- deal.notesChunks.0
- deal.notesChunks.1
- deal.notesChunks.2
- deal.notesChunks.3

Generated via:
splitIntoLines(deal.sellerConsiderations, 120, 4)
