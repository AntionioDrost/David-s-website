# CMP Canonical Domain Model

Last updated: 2026-06-18  
Status: Committed product source of truth

The canonical domain model is a property graph rooted at `PropertyRecord`. This document is a contract only; Stage 2 does not implement storage, adapters or live app wiring.

## Entity Graph

```text
PropertyRecord
  -> PropertyIdentity
  -> SourceReference[]
  -> SmartCheckResult[]
  -> LandlordAnswer[]
  -> Issue[]
  -> EvidenceItem[]
  -> ActionItem[]
  -> ServiceIntentDraft? via entry context
  -> ServiceRequest[]
  -> TimelineEvent[]
  -> MonitoringItem[]
  -> AskCmpContext
  -> ReportRecord[]
  -> ScenarioDefinition? via demo metadata
```

## PropertyRecord

Technical root entity for one property.

Required concepts:

- `id`: stable property identifier.
- `namespace`: owner, guest or demo namespace.
- `identity`: `PropertyIdentity`.
- `address`: display address derived from identity.
- `uprn`: UPRN when known.
- `creationSource`: public check, Add Property, service intent, problem-led journey, Ask CMP, demo scenario, migration or legacy import.
- `currentSetupStage`: add-property, smart-checks, review-found-data, answer-unknowns, property-brain, analysis, workspace.
- `lifecycleStatus`: draft, active, paused, archived or demo.
- `entryContext`: source route, service intent, problem, advice prompt or scenario ID.
- `smartCheckResults`: `SmartCheckResult[]`.
- `landlordAnswers`: `LandlordAnswer[]`.
- `issues`: `Issue[]`.
- `evidence`: `EvidenceItem[]`.
- `actions`: `ActionItem[]`.
- `serviceRequests`: `ServiceRequest[]`.
- `timeline`: `TimelineEvent[]`.
- `monitoring`: `MonitoringItem[]`.
- `reports`: `ReportRecord[]`.
- `demoMetadata`: scenario/demo fields when applicable.
- `createdAt` and `updatedAt`.
- `schemaVersion`.

## PropertyIdentity

Canonical property identity and address match state.

Fields:

- `displayAddress`
- `line1`
- `line2`
- `town`
- `county`
- `postcode`
- `uprn`
- `source`
- `matchStatus`: matched, likely_match, manual, unmatched or unknown.
- `confidence`: high, medium, low or unknown.
- `manualEdits`
- `previousValues`
- `history`

## SourceReference

Source and confidence metadata for a fact.

Supported source types:

- official source
- local-authority source
- user-stated
- document-extracted
- supplier-confirmed
- CMP historical record
- inferred
- missing
- unknown

Fields:

- `sourceType`
- `sourceLabel`
- `sourceIdentifier`
- `checkedDate`
- `confidence`
- `capabilityStatus`: simulated or live.
- `notes`

## SmartCheckResult

Sourced finding from a Smart Check.

Fields:

- `id`
- `propertyId`
- `checkType`
- `resultStatus`: found, likely, missing, unknown, conflict or not_applicable.
- `value`
- `sourceReferences`
- `confidence`
- `requiresConfirmation`
- `missingReason`
- `unknownReason`
- `checkedAt`
- `capabilityStatus`

## LandlordAnswer

User-stated answer to a required unknown or confirmation.

Fields:

- `id`
- `propertyId`
- `questionId`
- `answer`
- `context`: current, future, intended or historical.
- `source`: user-stated.
- `answeredAt`
- `dependencyKeys`
- `evidenceStatus`
- `editedHistory`
- `sourceReferences`

## Issue

Rules-derived gap, risk, missing evidence or compliance concern.

Fields:

- `id`
- `propertyId`
- `category`
- `status`: open, awaiting_evidence, in_progress, resolved or deferred.
- `severity`
- `legalUrgency`
- `confidence`
- `sourceReferences`
- `triggerFacts`
- `triggerAnswers`
- `affectedStage`
- `resolvedAt`
- `ruleVersion`
- `capabilityStatus`

## EvidenceItem

Proof state for a property, issue, action or service.

Fields:

- `id`
- `propertyId`
- `linkedIssueId`
- `linkedActionId`
- `linkedServiceRequestId`
- `evidenceType`
- `proofStatus`: held, missing, expired, unverified, needs_review or accepted.
- `verificationStatus`
- `source`
- `capabilityStatus`: simulated or live.
- `issuedDate`
- `expiryDate`
- `extractedFields`
- `userConfirmationState`
- `sourceReferences`

## ActionItem

Rules-derived next step.

Fields:

- `id`
- `propertyId`
- `linkedIssueId`
- `priority`
- `actionType`
- `reason`
- `sourceConfidenceSummary`
- `nextStep`
- `primaryCta`
- `secondaryCta`
- `serviceOptions`
- `status`: recommended, queued, in_progress, completed or dismissed.
- `createdAt`
- `updatedAt`

## ServiceIntentDraft

Public service-first draft before or during property attachment.

Fields:

- `id`
- `serviceId`
- `sourceRoute`
- `contact`
- `addressInput`
- `focusMode`
- `serviceAnswers`
- `evidencePlaceholders`
- `propertyId` when attached.
- `status`: draft, attached, converted, abandoned or closed.
- `createdAt`
- `updatedAt`

## ServiceRequest

Property-attached service request.

Fields:

- `id`
- `propertyId`
- `issueId`
- `actionId`
- `serviceId`
- `source`: public-service, action-plan, evidence-gap, ask-cmp or manual.
- `requestMode`: simulated or live.
- `requestStatus`: draft, quote_requested, quote_received, awaiting_payment, booked, in_progress, completed, evidence_received or closed.
- `propertyAccessDetails`
- `contactDetails`
- `evidenceExpected`
- `supplierJobPackData`
- `timelineEffects`
- `monitoringEffects`
- `capabilityStatus`
- `createdAt`
- `updatedAt`

## TimelineEvent

Chronological property activity.

Fields:

- `id`
- `propertyId`
- `eventType`
- `sourceEntityType`
- `sourceEntityId`
- `timestamp`
- `summary`
- `visibility`: public, landlord, internal or QA.
- `capabilityStatus`

## MonitoringItem

Derived monitoring, renewal or follow-up item.

Fields:

- `id`
- `propertyId`
- `sourceIssueId`
- `sourceActionId`
- `sourceEvidenceId`
- `sourceServiceRequestId`
- `monitoringType`
- `reason`
- `dueDate`
- `cadence`
- `currentState`
- `nextAction`
- `lastAnalysisDate`
- `capabilityStatus`

## AskCmpContext

Context bundle available to Ask CMP.

Fields:

- `currentProperty`
- `currentPage`
- `findings`
- `answers`
- `openIssues`
- `evidence`
- `actions`
- `confidenceState`
- `sourceState`
- `capabilityLimits`

Ask CMP reads this context and must not create unsupported facts.

## ReportRecord

Generated report or compliance pack.

Fields:

- `id`
- `propertyId`
- `reportType`
- `generatedFromVersion`
- `includedEvidenceIds`
- `includedIssueIds`
- `includedActionIds`
- `generatedAt`
- `capabilityStatus`
- `ruleVersion`
- `schemaVersion`

## ScenarioDefinition

Seed data contract for demos and scenarios.

Fields:

- `id`
- `label`
- `uniqueFictionalPropertyId`
- `uniqueFictionalAddress`
- `propertySeed`
- `smartCheckSeed`
- `answerSeed`
- `expectedIssues`
- `expectedTopAction`
- `expectedServices`
- `expectedMonitoring`
- `expectedRouteOutcome`

Rules:

- Scenario properties must be unique.
- `57 The Butts` may exist only as an explicit scenario fixture after migration.
- Scenario data must be namespaced from live or guest properties.
