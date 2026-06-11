# Requirements Document

## Introduction

This feature digitizes the bi-weekly household visit form (Appendix #1 Register) used by Health Extension Workers (HEWs) in Ethiopia's HealthTrack MCH system. Health workers currently fill out a paper form during each household visit, capturing maternal counseling indicators and child development/health indicators. After the visit, the completed report is submitted to a supervisor for review and approval.

The digital form mirrors the two-part paper register:
- **Maternal Section** (Appendix #1 – Maternal): For pregnant, postnatal, or lactating women
- **Child Section** (Appendix #1 – Child): For each child aged 0–6 years in the household

The workflow covers visit recording, submission, supervisor review/approval, and risk-based alerting.

---

## Glossary

- **HEW**: Health Extension Worker — the health worker conducting bi-weekly household visits
- **Supervisor**: The HEW's supervisor who reviews and approves submitted visit reports
- **Visit_Report**: A digital record of a single bi-weekly household visit, containing a Maternal Section and/or one or more Child Sections
- **Maternal_Section**: The part of the Visit_Report capturing health and counseling indicators for a pregnant, postnatal, or lactating woman (P/PN/L)
- **Child_Section**: The part of the Visit_Report capturing health, stimulation, and development indicators for a child aged 0–6 years
- **HH**: Household — the registered household being visited
- **ANC**: Antenatal Care — health care visits during pregnancy
- **PNC**: Postnatal Care — health care visits after childbirth (up to 60 days)
- **P**: Pregnant woman
- **PN**: Postnatal woman (up to 60 days after delivery; classified as Lactating after 60 days)
- **L**: Lactating woman
- **PSNP**: Productive Safety Net Program
- **CBHI**: Community Based Health Insurance (Free / Paid / No)
- **TDS**: Temporary Direct Support
- **SAM**: Severe Acute Malnutrition
- **MAM**: Moderate Acute Malnutrition
- **N**: No Acute Malnutrition
- **DD**: Developmental Delay
- **SD**: Suspected Developmental Delay
- **Disability_Categories**: Motor Disability (MD), Hearing Disability (HD), Visual Disability (VD), Physical Disability (PD), Psycho-social/Psychiatric (PP), Neurological Disability (ND)
- **Early_Stimulation_Score**: Frequency score for caregiver stimulation activities — 0 = Never; 1 = Sometimes (1–3 times in past 7 days); 2 = Yes (4+ times in past 7 days)
- **Risk_Flag**: A system-generated alert attached to a Visit_Report or a specific record indicating a condition requiring urgent attention
- **System**: The HealthTrack MCH Next.js/TypeScript web application

---

## Requirements

### Requirement 1: Household Visit Report Creation

**User Story:** As a HEW, I want to create a digital visit report for a household, so that I can record the health and counseling data I collect during my bi-weekly visit without using paper forms.

#### Acceptance Criteria

1. WHEN a HEW navigates to a registered household and initiates a new visit, THE System SHALL display a Visit_Report form pre-populated with the household's registration number, house number, name of household head, and phone number from the existing household record.
2. THE System SHALL allow the HEW to record the household-level program enrollment fields: vulnerability status (Y/N), PSNP enrollment (Y/N), CBHI status (Free/Paid/No), and TDS status (Y/N).
3. THE System SHALL allow the HEW to record the visit date and visit number (auto-incremented from previous visits for that household).
4. WHEN a household has no prior Visit_Reports, THE System SHALL set the visit number to 1 for the first report created for that household.
5. THE System SHALL allow the HEW to add one Maternal_Section per pregnant, postnatal, or lactating woman in the household and one or more Child_Sections for each child aged 0–6 years in the household.
6. IF a household has no eligible women or children, THEN THE System SHALL allow the HEW to submit the Visit_Report with only household-level fields completed.

---

### Requirement 2: Maternal Section Data Entry

**User Story:** As a HEW, I want to record all maternal health and counseling indicators for each eligible woman during the visit, so that her care and progress are accurately tracked.

#### Acceptance Criteria

1. THE System SHALL allow the HEW to link the Maternal_Section to an existing maternal record (pregnant, postnatal, or lactating woman) in the household.
2. THE System SHALL display the woman's name and age from her existing maternal record as read-only fields in the Maternal_Section.
3. WHERE the woman's status is postnatal (PN), THE System SHALL display the date of delivery from her record as a read-only field.
4. THE System SHALL require the HEW to record the following indicators for each visit, each as a Yes/No/NA selection:
   - ANC/PNC follow-up started (Y/N/NA)
   - ANC follow-up dropped (Y/N/NA)
   - Substance use — alcohol, smoke, or drugs (Y/N); if Yes, a free-text specification field SHALL be required
   - Signs of maternal depression (Y/N)
   - Diverse diet and extra meal (Y/N)
   - Iron folic acid supplementation (Y/N/NA)
   - Partner/family support (Y/N)
   - Signs of violence (Y/N)
5. WHERE the woman's status is pregnant (P), THE System SHALL additionally require the HEW to record early pregnancy stimulation activities: talking/singing/reading to the unborn baby, monitoring fetal movements, and belly massage (Y/N per activity).
6. THE System SHALL require the HEW to record whether the woman was referred for other services (Y/N); if Yes, THE System SHALL require selection of at least one referral reason from: ANC, PNC, Depression, Violence.
7. THE System SHALL require the HEW to record the next appointment date.
8. WHEN the postnatal woman's days since delivery exceed 60, THE System SHALL automatically reclassify her status as Lactating (L) and display a notification to the HEW.

---

### Requirement 3: Child Section Data Entry

**User Story:** As a HEW, I want to record all child health, stimulation, and development indicators for each child aged 0–6 in the household, so that their wellbeing and developmental progress are tracked accurately.

#### Acceptance Criteria

1. THE System SHALL allow the HEW to link each Child_Section to an existing child record (aged 0–6 years) in the household.
2. THE System SHALL display the child's name, sex, date of birth, and number of children under 6 in the household from the existing child record as read-only fields.
3. THE System SHALL display the caregiver's name, sex, age, and phone number from the linked child record as read-only fields.
4. THE System SHALL require the HEW to record the following Early Stimulation indicators using the Early_Stimulation_Score (0, 1, or 2):
   - Caregiver talks or sings to the child
   - Caregiver plays with the child
   - Caregiver tells stories or reads to the child
   - Caregiver plays outdoors with the child
5. THE System SHALL require the HEW to record whether the caregiver understands and responds to the child's needs (Y/N).
6. THE System SHALL require the HEW to record positive discipline practices (Y/N), referencing the four strategies: praise to encourage good behavior, redirect child's attention, selective ignoring.
7. THE System SHALL require the HEW to record whether the child's vaccination is up to date (Y/N/NA).
8. THE System SHALL require the HEW to record the feeding practice that applies from: exclusive breastfeeding, complementary feeding, balanced diet (Y/N per applicable option).
9. THE System SHALL require the HEW to record the child's nutritional status as one of: SAM, MAM, N (No Acute Malnutrition), or NA.
10. THE System SHALL require the HEW to record signs of abuse or violence (Y/N); if Yes, a free-text specification field SHALL be required.
11. THE System SHALL require the HEW to record whether the child has a toy at home (Y/N) and whether the child plays with a homemade toy (H) or a purchased toy.
12. THE System SHALL require the HEW to record whether the child was referred for services (Y/N); if Yes, THE System SHALL require selection of at least one referral reason from: Vitamin A, Deworming, Malnutrition, Developmental Delay, Abuse/Violence, Hospital, Other (with free-text specification).
13. THE System SHALL require the HEW to record the next appointment date for the child.
14. WHEN the visit falls on a developmental milestone assessment cycle (every two months), THE System SHALL display the developmental milestone assessment fields and require the HEW to record each milestone's status as: N (Normal), SD (Suspected Delay), or DD (Developmental Delay).
15. THE System SHALL allow the HEW to record disability screening results by selecting zero or more of the following categories that apply: MD, HD, VD, PD, PP, ND.
16. THE System SHALL allow the HEW to record the child's risk factors for development (Y/N).

---

### Requirement 4: Visit Report Validation

**User Story:** As a HEW, I want the system to validate my entries before submission, so that I don't accidentally submit incomplete or inconsistent data.

#### Acceptance Criteria

1. WHEN the HEW attempts to submit a Visit_Report, THE System SHALL validate that all required fields in the Maternal_Section and each Child_Section are completed.
2. IF a required field is missing at submission, THEN THE System SHALL highlight the incomplete fields and display a descriptive error message specifying which section and field requires attention.
3. WHEN the HEW selects "Yes" for substance use in the Maternal_Section, THE System SHALL enforce that the substance specification text field is not empty before allowing submission.
4. WHEN the HEW selects "Yes" for signs of violence in the Child_Section, THE System SHALL enforce that the specification text field is not empty before allowing submission.
5. WHEN the HEW selects "Yes" for referral in either section, THE System SHALL enforce that at least one referral reason is selected before allowing submission.
6. THE System SHALL validate that the visit date is not in the future before allowing submission.
7. THE System SHALL validate that the next appointment date is after the visit date before allowing submission.

---

### Requirement 5: Draft Saving

**User Story:** As a HEW, I want to save an incomplete visit report as a draft, so that I can pause and resume data entry without losing my progress.

#### Acceptance Criteria

1. THE System SHALL allow the HEW to save a Visit_Report as a draft at any point during data entry, without requiring all mandatory fields to be complete.
2. WHEN a draft is saved, THE System SHALL display a confirmation message and record the time the draft was last saved.
3. WHEN the HEW re-opens a draft Visit_Report, THE System SHALL restore all previously entered field values exactly as saved.
4. THE System SHALL display all draft Visit_Reports for a household in the household's visit history, clearly labeled as "Draft".

---

### Requirement 6: Visit Report Submission

**User Story:** As a HEW, I want to submit a completed visit report to my supervisor, so that the visit data is officially recorded and reviewed.

#### Acceptance Criteria

1. WHEN the HEW submits a Visit_Report, THE System SHALL set the report status to "Submitted" and record the submission timestamp and the HEW's user ID.
2. WHEN a Visit_Report is submitted, THE System SHALL make the report available in the assigned supervisor's review queue.
3. WHEN a Visit_Report is submitted, THE System SHALL send a notification to the supervisor indicating a new report is pending review.
4. WHEN a Visit_Report is submitted, THE System SHALL prevent the HEW from editing any fields in the submitted report unless the supervisor returns it for correction.
5. THE System SHALL display the submitted Visit_Report in the household's visit history with status "Submitted".

---

### Requirement 7: Supervisor Review and Approval

**User Story:** As a supervisor, I want to review submitted visit reports and approve or return them for correction, so that data quality is maintained before records are finalized.

#### Acceptance Criteria

1. THE System SHALL provide supervisors with a review queue listing all Visit_Reports with status "Submitted" from HEWs under their supervision, sorted by submission date ascending.
2. WHEN a supervisor opens a Visit_Report for review, THE System SHALL display all fields from the Maternal_Section and each Child_Section in a read-only view.
3. THE System SHALL allow the supervisor to approve a Visit_Report, setting its status to "Approved" and recording the supervisor's user ID and approval timestamp.
4. THE System SHALL allow the supervisor to return a Visit_Report to the HEW for correction, requiring the supervisor to enter a comment explaining what needs to be corrected.
5. WHEN a Visit_Report is returned for correction, THE System SHALL set the report status to "Returned" and notify the HEW with the supervisor's comment.
6. WHEN a Visit_Report is returned, THE System SHALL unlock the report for editing by the HEW and allow the HEW to resubmit after making corrections.
7. WHEN a supervisor approves a Visit_Report, THE System SHALL notify the HEW that their report has been approved.

---

### Requirement 8: Risk-Based Alerts and Flags

**User Story:** As a supervisor and HEW, I want the system to automatically flag high-risk conditions identified during a visit, so that urgent cases receive prompt attention.

#### Acceptance Criteria

1. WHEN a Child_Section records a nutritional status of SAM, THE System SHALL attach a high-priority Risk_Flag to the Visit_Report and display a prominent alert to the HEW before submission.
2. WHEN a Child_Section records a nutritional status of MAM, THE System SHALL attach a medium-priority Risk_Flag to the Visit_Report.
3. WHEN a Maternal_Section records signs of maternal depression as "Yes", THE System SHALL attach a high-priority Risk_Flag to the Visit_Report.
4. WHEN a Maternal_Section records signs of violence as "Yes", THE System SHALL attach a high-priority Risk_Flag to the Visit_Report.
5. WHEN a Child_Section records signs of abuse or violence as "Yes", THE System SHALL attach a high-priority Risk_Flag to the Visit_Report.
6. WHEN a Child_Section records a developmental milestone status of DD (Developmental Delay), THE System SHALL attach a medium-priority Risk_Flag to the Visit_Report.
7. WHEN a Visit_Report containing one or more high-priority Risk_Flags is submitted, THE System SHALL send an urgent notification to the supervisor in addition to the standard submission notification.
8. THE System SHALL display all Risk_Flags on the Visit_Report summary visible to both the HEW and the supervisor.

---

### Requirement 9: Visit History and Longitudinal Tracking

**User Story:** As a HEW and supervisor, I want to view the full history of visit reports for a household, so that I can track trends and changes over time.

#### Acceptance Criteria

1. THE System SHALL display a visit history list for each household, showing all Visit_Reports ordered by visit date descending.
2. WHEN viewing a household's visit history, THE System SHALL display for each Visit_Report: visit date, visit number, status (Draft/Submitted/Approved/Returned), assigned HEW name, and any Risk_Flags.
3. THE System SHALL allow a HEW or supervisor to open any previously submitted or approved Visit_Report in read-only view.
4. WHEN viewing a maternal record, THE System SHALL display a longitudinal summary of key indicators across all approved Visit_Reports (e.g., depression status, IFA supplementation, ANC follow-up).
5. WHEN viewing a child record, THE System SHALL display a longitudinal summary of nutritional status, Early_Stimulation_Scores, and developmental milestone statuses across all approved Visit_Reports.

---

### Requirement 10: Notifications

**User Story:** As a HEW and supervisor, I want to receive timely notifications about visit report events, so that I can act quickly on pending tasks and urgent cases.

#### Acceptance Criteria

1. WHEN a Visit_Report is submitted by a HEW, THE System SHALL send a notification to the assigned supervisor within the application.
2. WHEN a supervisor approves a Visit_Report, THE System SHALL send an in-app notification to the HEW who submitted the report.
3. WHEN a supervisor returns a Visit_Report for correction, THE System SHALL send an in-app notification to the HEW, including the supervisor's correction comment.
4. WHEN a Visit_Report contains a high-priority Risk_Flag, THE System SHALL send an urgent in-app notification to the supervisor upon submission.
5. WHEN a household's scheduled visit date is within 2 days and no Visit_Report has been created for that visit cycle, THE System SHALL send a reminder notification to the assigned HEW.
6. IF a HEW has a Visit_Report in "Returned" status for more than 3 days without resubmission, THEN THE System SHALL send a reminder notification to the HEW and a notification to the supervisor.
