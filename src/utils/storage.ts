/**
 * Offline-First High-Reliability Storage & State Manager
 * Pre-seeded with authentic AVM bus factory operations data.
 * Zero-latency local reads/writes resistant to network drops and load-shedding.
 */

export const AVM_PRODUCTION_STAGES = [
  'Chassis Assembly',
  'Assembly',
  'Frames',
  'Coach Building',
  'Paint Shop',
  'Finishing',
  'PDI (Pre-Delivery Inspection)',
] as const;

export interface FeederDepartmentInfo {
  id: string;
  name: string;
  suppliesTo: string[];
  description: string;
  currentWipCount: number;
  health: 'NORMAL' | 'WARNING' | 'BOTTLENECK';
  keyComponents: string[];
}

export const FEEDER_DEPARTMENTS: FeederDepartmentInfo[] = [
  {
    id: 'COMPONENTS_PRODUCTION',
    name: 'Components Production',
    suppliesTo: ['Chassis Assembly', 'Frames', 'Trimming'],
    description: 'Press shop, laser cutting, tube bending, bracket fabrication, and stamped sub-components.',
    currentWipCount: 142,
    health: 'NORMAL',
    keyComponents: ['Chassis Outriggers', 'Seat Stanchion Brackets', 'Truss gussets', 'Spring hanger plates'],
  },
  {
    id: 'TRIMMING',
    name: 'Trimming',
    suppliesTo: ['Finishing'],
    description: 'Seat upholstery sewing, vinyl wrapping, headliner trimming, driver modesty screen tailoring.',
    currentWipCount: 52,
    health: 'NORMAL',
    keyComponents: ['Passenger double seats', 'Driver ergonomic seat', 'Roof parcel racks', 'Luggage netting'],
  },
  {
    id: 'FIBRE_SHOP',
    name: 'Fibre Shop',
    suppliesTo: ['Coach Building', 'Finishing'],
    description: 'Resin transfer moulding (RTM), fibreglass (FRP) lay-up, gelcoat spray, front/rear nose cones.',
    currentWipCount: 18,
    health: 'NORMAL',
    keyComponents: ['Aerodynamic front cap', 'Rear engine access hatch', 'Wheel arch flares', 'Dashboard cowl'],
  },
  {
    id: 'WINDOW_SECTION',
    name: 'Window Section',
    suppliesTo: ['Finishing'],
    description: 'Toughened ECE R43 glazing prep, windscreen primer application, sliding sash window framing.',
    currentWipCount: 24,
    health: 'NORMAL',
    keyComponents: ['Curved laminated windscreens', 'Tinted side glass panes', 'Emergency escape pop-out glass'],
  },
  {
    id: 'PRODUCTION_STORES',
    name: 'Production Stores',
    suppliesTo: ['All Line Departments'],
    description: 'Central material stores inventory, raw steel yard, fastener aisles, ATEX chemical paint store.',
    currentWipCount: 840,
    health: 'NORMAL',
    keyComponents: ['Structural steel', 'Fasteners', 'Polyurethanes', 'Paints', 'Electrical looms'],
  },
];

export interface BusProductionItem {
  id: string;
  busNo: string;
  customer: string;
  model: 'City Commuter 65-Seat' | 'Intercity Express 52-Seat' | 'School Bus 70-Seat' | 'Heavy Duty Rural 60-Seat';
  stage: number; // 1: Chassis Assembly, 2: Assembly, 3: Frames, 4: Coach Building, 5: Paint Shop, 6: Finishing, 7: PDI
  stageName: string;
  status: 'In Progress' | 'Blocked' | 'Completed';
  blocker?: string;
  isDesignFrozen: boolean;
  targetLiveryCode: string;
  startDate: string;
  estimatedDelivery: string;
  assignedBay: string;
  leadTechnician: string;
}

export interface DrawingReviewComment {
  id: string;
  author: string;
  role: string;
  date: string;
  comment: string;
  recommendation: 'APPROVE' | 'REVISE' | 'OBSERVE';
}

export interface DrawingChangeHistoryItem {
  rev: string;
  date: string;
  author: string;
  description: string;
}

export interface DrawingItem {
  id: string;
  drawingNo: string;
  title: string;
  version: string;
  category: 'Structural' | 'Panel & Body' | 'Electrical' | 'Paint & Livery' | 'Interior';
  status: 'ACTIVE' | 'OBSOLETE' | 'UNDER_REVIEW';
  approvedBy: string;
  approvedDate: string;
  physicalLocation: string;
  fileSizeKb: number;
  // Detailed Engineering Review & Governance
  leadReviewer?: string;
  leadReviewerRole?: string;
  latestReviewDate?: string;
  reviewVerdict?: 'APPROVED' | 'CONDITIONAL_PASS' | 'UNDER_REVIEW' | 'SUPERSEDED';
  reviewCode?: string;
  standardsCompliance?: string[];
  criticalTolerances?: string;
  designRationale?: string;
  reviewNotes?: string;
  changeHistory?: DrawingChangeHistoryItem[];
  reviewComments?: DrawingReviewComment[];
  drawingImageUrl?: string;
}

export type QualityGateType =
  | 'Gate 1: Weld Inspection'
  | 'Gate 2: Paint & Surface Inspection'
  | 'Gate 3: Electrical Check'
  | 'Gate 4: Seat / Stitching / Alignment Check'
  | 'Gate 5: Assembly Completeness'
  | 'Final Inspection: Shower & Road Test';

export interface QualityCheckpointItem {
  id: string;
  busNo: string;
  stageGate: QualityGateType | string;
  inspector: string;
  inspectorRole?: string;
  date: string;
  checks: Record<string, boolean>;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
  redTagIssued: boolean;
  redTagNo?: string;
  redTagReason?: string;
  signoffNotes: string;
  voiceMemoTranscription?: string;
  photoEvidenceUrl?: string;
  zoneTag?: 'Front Cap' | 'Left Side' | 'Right Side' | 'Rear Cap' | 'Roof' | 'Interior' | 'Chassis';
}

export interface DefectItem {
  id: string;
  busNo: string;
  code: 'W-01' | 'W-02' | 'W-03' | 'P-01' | 'P-02' | 'P-03' | 'D-01' | 'F-01' | 'E-01' | 'S-01' | 'A-01';
  codeName: string;
  stage: string;
  description: string;
  severity: 'Critical' | 'Major' | 'Minor';
  rootCause: string;
  correctiveAction: string;
  status: 'OPEN' | 'RESOLVED';
  reportedBy: string;
  reportedDate: string;
  resolvedDate?: string;
  zone?: 'Front Cap' | 'Left Side' | 'Right Side' | 'Rear Cap' | 'Roof' | 'Interior' | 'Underbody';
  pinX?: number; // Percent 0-100 on vehicle diagram
  pinY?: number; // Percent 0-100 on vehicle diagram
  photoUrl?: string;
}

export interface FeedbackItem {
  id: string;
  source: 'Driver' | 'Mechanic' | 'Fleet Owner' | 'Passenger';
  busModel: string;
  category: 'Ergonomics' | 'Durability' | 'Maintenance' | 'Passenger Comfort' | 'Paint & Finish';
  feedbackText: string;
  actionTaken: string;
  status: 'PENDING_REVIEW' | 'IMPLEMENTED_IN_REV' | 'CLOSED';
  date: string;
}

export interface MaterialStockItem {
  id: string;
  code: string;
  name: string;
  category: 'Steel & Frame' | 'Panels & Cladding' | 'Paints & Primers' | 'Hardware & Fasteners' | 'Glass & Glazing' | 'Electrical' | 'Upholstery';
  unit: string;
  currentStock: number;
  minLevel: number;
  maxLevel: number;
  unitCostUsd: number;
  storageBin: string;
  supplier: string;
  // Warehouse & Yard Coordinate Storage
  storageZone?: 'Yard Cantilever Racks' | 'Sheet Metal Leaf Racks' | 'ATEX Paint Mix Room' | 'Bonding & Adhesive Vault' | 'Fastener Aisle' | 'Glass A-Frame' | 'Trim Mezzanine';
  locationCode?: string; // e.g. YARD-CANT-04, AISLE-03-B18, PAINT-ATEX-C2
  batchLotNo?: string;
  expiryDate?: string;
  tempControlled?: boolean;
  storageTempC?: string;
  kanbanCardStatus?: 'BIN_1_FULL' | 'BIN_2_BUFFER' | 'REORDER_TRIGGERED';
  lastIssuedToJob?: string;
}

export interface StandardOptionItem {
  category: 'Seating Layout' | 'Interior Trim' | 'Powertrain' | 'Climate Control' | 'Paint Finish';
  optionCode: string;
  name: string;
  description: string;
  standardLeadTimeDays: number;
  costDeltaUsd: number;
  isPopular: boolean;
}

// Default Seed Data
const DEFAULT_BUSES: BusProductionItem[] = [
  {
    id: 'BUS-01',
    busNo: 'AVM-2026-08',
    customer: 'ZUPCO Harare Metro',
    model: 'City Commuter 65-Seat',
    stage: 5,
    stageName: 'Paint Shop',
    status: 'In Progress',
    isDesignFrozen: true,
    targetLiveryCode: 'RAL-9010',
    startDate: '2026-09-10',
    estimatedDelivery: '2026-10-05',
    assignedBay: 'Paint Shop Booth 1',
    leadTechnician: 'C. Moyo',
  },
  {
    id: 'BUS-02',
    busNo: 'AVM-2026-09',
    customer: 'Falcon Safari Express',
    model: 'Intercity Express 52-Seat',
    stage: 4,
    stageName: 'Coach Building',
    status: 'In Progress',
    isDesignFrozen: true,
    targetLiveryCode: 'AVM-GOLD',
    startDate: '2026-09-14',
    estimatedDelivery: '2026-10-12',
    assignedBay: 'Coach Building Bay 2',
    leadTechnician: 'D. Ncube',
  },
  {
    id: 'BUS-03',
    busNo: 'AVM-2026-10',
    customer: 'Kutama High School',
    model: 'School Bus 70-Seat',
    stage: 3,
    stageName: 'Frames',
    status: 'In Progress',
    isDesignFrozen: false,
    targetLiveryCode: 'RAL-1023',
    startDate: '2026-09-18',
    estimatedDelivery: '2026-10-20',
    assignedBay: 'Frames Bay 3',
    leadTechnician: 'M. Zondo',
  },
  {
    id: 'BUS-04',
    busNo: 'AVM-2026-11',
    customer: 'Mutare Rural Council',
    model: 'Heavy Duty Rural 60-Seat',
    stage: 1,
    stageName: 'Chassis Assembly',
    status: 'In Progress',
    isDesignFrozen: false,
    targetLiveryCode: 'ZIM-GREEN',
    startDate: '2026-09-22',
    estimatedDelivery: '2026-10-28',
    assignedBay: 'Chassis Jig Bay 1',
    leadTechnician: 'K. Shumba',
  },
  {
    id: 'BUS-05',
    busNo: 'AVM-2026-07',
    customer: 'Bulawayo Transit Corp',
    model: 'City Commuter 65-Seat',
    stage: 6,
    stageName: 'Finishing',
    status: 'Blocked',
    blocker: 'Awaiting seat upholstery delivery from Trimming department.',
    isDesignFrozen: true,
    targetLiveryCode: 'AVM-COMMUTER',
    startDate: '2026-09-02',
    estimatedDelivery: '2026-09-30',
    assignedBay: 'Finishing Bay 4',
    leadTechnician: 'E. Sithole',
  },
  {
    id: 'BUS-06',
    busNo: 'AVM-2026-06',
    customer: 'Victoria Falls Shuttles',
    model: 'Intercity Express 52-Seat',
    stage: 7,
    stageName: 'PDI (Pre-Delivery Inspection)',
    status: 'Completed',
    isDesignFrozen: true,
    targetLiveryCode: 'RAL-5010',
    startDate: '2026-08-25',
    estimatedDelivery: '2026-09-29',
    assignedBay: 'PDI Test Bay 7',
    leadTechnician: 'P. Choto',
  },
  {
    id: 'BUS-07',
    busNo: 'AVM-2026-12',
    customer: 'Masvingo City Transit',
    model: 'City Commuter 65-Seat',
    stage: 2,
    stageName: 'Assembly',
    status: 'In Progress',
    isDesignFrozen: false,
    targetLiveryCode: 'RAL-9010',
    startDate: '2026-09-25',
    estimatedDelivery: '2026-10-31',
    assignedBay: 'Assembly Bay 2',
    leadTechnician: 'T. Sibanda',
  },
];

const DEFAULT_DRAWINGS: DrawingItem[] = [
  {
    id: 'DWG-01',
    drawingNo: 'AVM-STR-2026-01',
    title: 'Main Ladder Chassis Welded Assembly (12m)',
    version: 'Rev 4.2',
    category: 'Structural',
    status: 'ACTIVE',
    approvedBy: 'Eng. T. Mutasa',
    approvedDate: '2026-08-15',
    physicalLocation: 'Cabinet A - Drawer 1 (Master Red Stamp)',
    fileSizeKb: 3420,
    drawingImageUrl: '/images/dwg_chassis_cad.jpg',
    leadReviewer: 'Eng. T. Mutasa, Pr.Eng',
    leadReviewerRole: 'Chief Structural & Automotive Engineer (ZIE #1142)',
    latestReviewDate: '2026-08-15',
    reviewVerdict: 'APPROVED',
    reviewCode: 'REV-STR-2026-42',
    standardsCompliance: [
      'AWS D1.1 Structural Welding Code - Steel Class A',
      'ISO 5817 Quality Level B (Visual & Macro Perfection)',
      'SABS 0400 / UNECE R66 (Bus Superstructure Roll-Over Integrity)',
      'AVM Plant WPS-04 (MIG 82/18 Structural Joint Specification)',
    ],
    criticalTolerances:
      'Wheelbase diagonal squareness: ±1.5mm max over 12,000mm length. Front & rear axle hanger coplanarity: ±0.8mm. Outrigger perpendicularity: 90° ±0.5°. Continuous fillet throat thickness ≥ 6.0mm.',
    designRationale:
      'High-corrugation African transit optimization: Main longitudinal rails utilize 200x75x6mm parallel flange channel (PFC) fabricated from certified 350WA high-tensile structural steel. Outrigger gussets thickened from 4.5mm to 6.0mm at high-stress torsion transition zones over rear drive axle mountings following 2025 rough-road fatigue audits.',
    reviewNotes:
      'Final Design Review signed off for 2026 fleet production. FEA simulation verifies 2.4 static safety factor under 18,500 kg Gross Vehicle Mass (GVM) dynamic loading. All longitudinal welds specified as continuous MIG passes (82% Ar / 18% CO2). 100% visual AWS D1.1 inspection required on Bay 1 jig before releasing to Stage 2.',
    changeHistory: [
      {
        rev: 'Rev 4.2',
        date: '2026-08-15',
        author: 'Eng. T. Mutasa',
        description: 'Thickened outrigger gusset to 6.0mm 350WA steel; revised fastener torque to 320 Nm Grade 10.9.',
      },
      {
        rev: 'Rev 4.1',
        date: '2026-05-10',
        author: 'Eng. K. Moyo',
        description: 'Re-routed rear fuel tank cradle mounting brackets to allow dual 250L aluminum tank configuration.',
      },
      {
        rev: 'Rev 4.0',
        date: '2026-01-20',
        author: 'Eng. T. Mutasa',
        description: 'Baseline production release for 2026 ZUPCO City Commuter batch.',
      },
    ],
    reviewComments: [
      {
        id: 'RC-01',
        author: 'Eng. T. Mutasa',
        role: 'Chief Structural Engineer',
        date: '2026-08-15',
        comment:
          'Weld geometry and structural calculations validated against Harare-Bulawayo highway dynamic shock data. Approved for Stage 1 Chassis jigging.',
        recommendation: 'APPROVE',
      },
      {
        id: 'RC-02',
        author: 'C. Moyo',
        role: 'Lead QC Inspector',
        date: '2026-08-16',
        comment:
          'Confirmed Bay 1 clamping fixtures hold ±1.2mm diagonal variance, comfortably within the ±1.5mm tolerance envelope.',
        recommendation: 'APPROVE',
      },
    ],
  },
  {
    id: 'DWG-02',
    drawingNo: 'AVM-BDY-2026-08',
    title: 'Galvaneal Exterior Side Panel Stiffener Jig Layout',
    version: 'Rev 3.0',
    category: 'Panel & Body',
    status: 'ACTIVE',
    approvedBy: 'Eng. T. Mutasa',
    approvedDate: '2026-07-20',
    physicalLocation: 'Cabinet A - Drawer 2',
    fileSizeKb: 2150,
    drawingImageUrl: '/images/dwg_panel_cad.jpg',
    leadReviewer: 'Eng. T. Mutasa',
    leadReviewerRole: 'Lead Body & Framing Engineer',
    latestReviewDate: '2026-07-20',
    reviewVerdict: 'APPROVED',
    reviewCode: 'REV-BDY-2026-30',
    standardsCompliance: [
      'ISO 9001:2015 Body & Cladding Assembly Standards',
      'SAE J2334 Cyclic Corrosion Resistance (1,000 hrs Salt Spray)',
      'AVM Body Standard Tolerance Code ST-02',
    ],
    criticalTolerances:
      'Panel-to-frame reveal gap: 2.0mm ±0.5mm. Rivet / plug weld pitch: 80mm ±2mm along perimeter. Window aperture diagonal variation: ≤ 1.0mm. Panel oil-canning deflection: < 0.5mm at 25°C.',
    designRationale:
      'Thermal expansion and anti-drumming design: Uses 1.2mm zinc-iron alloy galvaneal steel bonded with Sikaflex-252 high-modulus polyurethane adhesive to eliminate thermal distortion during 70°C paint booth bake cycles. Polyurethane dampening strips placed at mid-panel harmonic vibration nodes.',
    reviewNotes:
      'Body jig layout reviewed and approved for Bay 2. Clamping sequence must proceed from lower belt rail upward to roof cant rail to prevent trapped shear stress in cladding sheets.',
    changeHistory: [
      {
        rev: 'Rev 3.0',
        date: '2026-07-20',
        author: 'Eng. T. Mutasa',
        description: 'Standardized on Sikaflex structural adhesive bonding with 80mm plug weld intervals.',
      },
      {
        rev: 'Rev 2.0',
        date: '2025-11-04',
        author: 'Eng. P. Chitando',
        description: 'Reduced panel thickness from 1.6mm to 1.2mm high-tensile galvaneal to save 140kg total tare weight.',
      },
    ],
    reviewComments: [
      {
        id: 'RC-03',
        author: 'Eng. T. Mutasa',
        role: 'Lead Body Engineer',
        date: '2026-07-20',
        comment:
          'Stiffener channel spacing verified to withstand tropical wind drag at 100 km/h with zero flutter. Passed fit-up check.',
        recommendation: 'APPROVE',
      },
    ],
  },
  {
    id: 'DWG-03',
    drawingNo: 'AVM-PNT-2026-04',
    title: 'Fleet Standard 2K Polyurethane Livery Masking Scheme',
    version: 'Rev 2.1',
    category: 'Paint & Livery',
    status: 'ACTIVE',
    approvedBy: 'C. Moyo (Lead QC)',
    approvedDate: '2026-08-01',
    physicalLocation: 'Cabinet C - Paint Shop Station',
    fileSizeKb: 4890,
    drawingImageUrl: '/images/dwg_livery_cad.jpg',
    leadReviewer: 'C. Moyo',
    leadReviewerRole: 'Lead QC Paint Specialist & Coating Chemist',
    latestReviewDate: '2026-08-01',
    reviewVerdict: 'APPROVED',
    reviewCode: 'REV-PNT-2026-21',
    standardsCompliance: [
      'ASTM D2244 Standard Practice for Calculation of Color Tolerances (Delta E < 2.0)',
      'ASTM D3359 Cross-Hatch Adhesion Tape Test (Class 4B/5B)',
      'ISO 2808 Paints and Varnishes - Determination of Film Thickness',
    ],
    criticalTolerances:
      'Total Dry Film Thickness (DFT): 110–135 microns (Primer 45µm, Color Base 35µm, Clearcoat 45µm). Livery separation line sharpness: Edge feathering < 0.3mm. Side stripe alignment across passenger doors: ±1.0mm. 60° Glossmeter reading: ≥ 88 GU.',
    designRationale:
      'Designed to standardize livery application for ZUPCO Harare Metro Blue (#003882) and Heritage Crimson (#DC2626). Solves previous issues with composite front cap color mismatch by specifying spectrophotometer verification prior to clearcoat application.',
    reviewNotes:
      'Coating specification approved. 3-stage iron phosphate wash required on bare steel prior to epoxy zinc-rich primer. Oven bake profile: 45 minutes at 65°C metal temperature.',
    changeHistory: [
      {
        rev: 'Rev 2.1',
        date: '2026-08-01',
        author: 'C. Moyo',
        description: 'Added mandatory Delta E spectrophotometer check and stone-chip resistant clearcoat on lower skirt panels.',
      },
      {
        rev: 'Rev 2.0',
        date: '2026-02-14',
        author: 'C. Moyo',
        description: 'Converted from single-stage synthetic enamel to 2K high-solids polyurethane system.',
      },
    ],
    reviewComments: [
      {
        id: 'RC-04',
        author: 'C. Moyo',
        role: 'Coating Chemist',
        date: '2026-08-01',
        comment:
          'Masking tape grade fine-line 218 specified to prevent adhesive bleed under tropical humidity. Spectrophotometer target delta E limit certified at 1.8 max.',
        recommendation: 'APPROVE',
      },
    ],
  },
  {
    id: 'DWG-04',
    drawingNo: 'AVM-STR-2024-09',
    title: 'Superseded Tubular Crossmember Support (Manual Mitre)',
    version: 'Rev 1.8',
    category: 'Structural',
    status: 'OBSOLETE',
    approvedBy: 'Eng. R. Dube',
    approvedDate: '2024-03-12',
    physicalLocation: 'Archive Vault (Do Not Use on Shop Floor)',
    fileSizeKb: 1840,
    drawingImageUrl: '/images/dwg_obsolete_cad.jpg',
    leadReviewer: 'Eng. R. Dube',
    leadReviewerRole: 'Senior QA Compliance Engineer',
    latestReviewDate: '2024-03-12',
    reviewVerdict: 'SUPERSEDED',
    reviewCode: 'REV-STR-2024-18',
    standardsCompliance: [
      'WITHDRAWN & REVOKED per ECN-2024-88',
      'Superseded by AVM-STR-2026-01',
    ],
    criticalTolerances: 'Not applicable - Obsolete document. Prohibited from shop floor usage.',
    designRationale:
      'Superseded due to excessive manual labor cutting compound angle mitres on shop floor and fatigue cracking at tubular joints during rough road trials. Replaced by laser-cut CNC bent channel section.',
    reviewNotes:
      'CRITICAL SHOP FLOOR NOTICE: This drawing is obsolete and revoked. No parts may be fabricated to this drawing under any circumstances. Physical master stamped "OBSOLETE" in red ink in vault.',
    changeHistory: [
      {
        rev: 'Rev 1.8',
        date: '2024-03-12',
        author: 'Eng. R. Dube',
        description: 'Formally marked obsolete and superseded by AVM-STR-2026-01.',
      },
    ],
    reviewComments: [
      {
        id: 'RC-05',
        author: 'Eng. R. Dube',
        role: 'QA Engineer',
        date: '2024-03-12',
        comment: 'Revocation verified. All workshop prints recalled and destroyed.',
        recommendation: 'REVISE',
      },
    ],
  },
];

const DEFAULT_CHECKPOINTS: QualityCheckpointItem[] = [
  {
    id: 'QC-2026-01',
    busNo: 'AVM-2026-08',
    stageGate: 'Gate 1: Weld Inspection',
    inspector: 'C. Moyo',
    inspectorRole: 'Lead QC Structural Inspector',
    date: '2026-09-12',
    checks: {
      'AWS D1.1 Weld Bead Uniformity': true,
      'Chassis Diagonal Squareness (±1.5mm)': true,
      'Continuous Fillet Throat Thickness ≥ 6mm': true,
      'Zero Surface Porosity / Undercut': true,
      'Axle Hanger Coplanarity & Outrigger Squareness': true,
    },
    result: 'PASS',
    redTagIssued: false,
    signoffNotes: 'All longitudinal main chassis ladder welds 100% inspected. Magnetic particle test passed on rear suspension outriggers.',
    zoneTag: 'Chassis',
  },
  {
    id: 'QC-2026-02',
    busNo: 'AVM-2026-09',
    stageGate: 'Gate 2: Paint & Surface Inspection',
    inspector: 'T. Sibanda',
    inspectorRole: 'Surface Quality Specialist',
    date: '2026-09-20',
    checks: {
      'Total Dry Film Thickness (110–135µm)': false,
      'Spectrophotometer Color Delta E ≤ 1.0': true,
      '60° Glossmeter Reading ≥ 88 GU': true,
      'Orange Peel & Waviness Score ≤ 3.5': false,
      'Cross-Hatch Adhesion Test (ASTM 4B/5B)': true,
      'Absence of Runs, Sags & Fisheyes': false,
    },
    result: 'FAIL',
    redTagIssued: true,
    redTagNo: 'RED-TAG-048',
    redTagReason: 'Left-hand waistline panel exhibits heavy orange peel (score 6.2) and local clearcoat run below rear quarter window.',
    signoffNotes: 'Bay 4 quarantined. Block sanding with P1500 wet abrasive and localized base/clear blend required before Gate 3 transfer.',
    zoneTag: 'Left Side',
  },
  {
    id: 'QC-2026-03',
    busNo: 'AVM-2026-08',
    stageGate: 'Gate 2: Paint & Surface Inspection',
    inspector: 'C. Moyo',
    inspectorRole: 'Lead QC Coating Chemist',
    date: '2026-09-18',
    checks: {
      'Total Dry Film Thickness (110–135µm)': true,
      'Spectrophotometer Color Delta E ≤ 1.0': true,
      '60° Glossmeter Reading ≥ 88 GU': true,
      'Orange Peel & Waviness Score ≤ 3.5': true,
      'Cross-Hatch Adhesion Test (ASTM 4B/5B)': true,
      'Absence of Runs, Sags & Fisheyes': true,
    },
    result: 'PASS',
    redTagIssued: false,
    signoffNotes: 'Harare Metro Pure White RAL-9010 Delta E verified at 0.38. Glossmeter recorded 91.4 GU. Flawless mirror DOI.',
    zoneTag: 'Left Side',
  },
  {
    id: 'QC-2026-04',
    busNo: 'AVM-2026-06',
    stageGate: 'Gate 3: Electrical Check',
    inspector: 'E. Sibanda',
    inspectorRole: 'Automotive Electrical Systems Inspector',
    date: '2026-09-24',
    checks: {
      '24V DC Main Harness Continuity & Dielectric Test': true,
      'Battery Isolator & Dual Alternator Charging Relay': true,
      'LED Destination Route Matrix Programming': true,
      'Exterior Lighting & Indicator Hazard Amperage Draw': true,
      'Emergency Door Interlock Switch & Audio Buzzer': true,
      'Heavy-Duty Windscreen Wiper & Washer Sweep Test': true,
    },
    result: 'PASS',
    redTagIssued: false,
    signoffNotes: 'All 24V bus looms insulation tested at 500V DC megger (resistance > 100MΩ). Multiplex CANbus nodes responding with zero fault codes.',
    zoneTag: 'Interior',
  },
  {
    id: 'QC-2026-05',
    busNo: 'AVM-2026-03',
    stageGate: 'Gate 4: Seat / Stitching / Alignment Check',
    inspector: 'P. Dlamini',
    inspectorRole: 'Interior & Ergonomics QC Inspector',
    date: '2026-09-26',
    checks: {
      'Seat Frame M10 Floor Rail Bolt Torque (≥ 45 Nm)': true,
      'Gangway Aisle Clearance Width (≥ 380mm per UN ECE R107)': true,
      'Heavy-Duty Vinyl Stitching Tensile Integrity': true,
      'Seatbelt Retractor & Anchor Pull-Test Compliance': true,
      'Passenger Stanchion Grab Handles & Modesty Screens': true,
      'Anti-Vandal Seat Back Rest Deflection Tolerance': true,
    },
    result: 'PASS',
    redTagIssued: false,
    signoffNotes: '65 passenger seat units torque checked with calibrated Norbar wrench. Aisle measured at 410mm clear width.',
    zoneTag: 'Interior',
  },
  {
    id: 'QC-2026-06',
    busNo: 'AVM-2026-01',
    stageGate: 'Gate 5: Assembly Completeness',
    inspector: 'C. Moyo',
    inspectorRole: 'Plant QA Manager',
    date: '2026-09-28',
    checks: {
      'Polyurethane Window Seal Curing & Continuity': true,
      'Luggage Rack Deflection Load Test (80kg/m)': true,
      'Floor Vinyl Seam Hot-Air Welding & Grip Tread': true,
      'Dual 9kg Dry Chemical Fire Extinguishers & First Aid Kit': true,
      'Emergency Roof Escape Hatch Dual Latches & Safety Hammers': true,
      'Driver Instrument Cluster Calibration & Sunblind': true,
    },
    result: 'PASS',
    redTagIssued: false,
    signoffNotes: 'All cabin fittings 100% verified against Master Specification drawing AVM-INT-2026-01. Ready for Monsoon Shower Booth test.',
    zoneTag: 'Interior',
  },
];

const DEFAULT_DEFECTS: DefectItem[] = [
  {
    id: 'DEF-01',
    busNo: 'AVM-2026-09',
    code: 'P-02',
    codeName: 'Panel Misalignment',
    stage: 'Gate 2: Paint & Surface Inspection',
    description: 'Gap of 4.2mm between lower skirt panel and waistline rail on bay 2.',
    severity: 'Major',
    rootCause: 'Manual clamping jig slipped due to worn locating pin.',
    correctiveAction: 'Replaced locating pin on jig B-4, refit panel with precision spacer block.',
    status: 'OPEN',
    reportedBy: 'T. Sibanda',
    reportedDate: '2026-09-25',
    zone: 'Left Side',
    pinX: 42,
    pinY: 68,
  },
  {
    id: 'DEF-02',
    busNo: 'AVM-2026-10',
    code: 'W-01',
    codeName: 'Weld Porosity',
    stage: 'Gate 1: Weld Inspection',
    description: 'Surface gas pocket porosity along 120mm run on outrigger bracket.',
    severity: 'Critical',
    rootCause: 'Draft from open factory door disrupted CO2 shielding gas coverage.',
    correctiveAction: 'Ground out porous weld to bare parent metal, erected welding wind screen, re-welded with preheat.',
    status: 'RESOLVED',
    reportedBy: 'K. Shumba',
    reportedDate: '2026-09-22',
    resolvedDate: '2026-09-23',
    zone: 'Underbody',
    pinX: 70,
    pinY: 82,
  },
  {
    id: 'DEF-03',
    busNo: 'AVM-2026-08',
    code: 'F-01',
    codeName: 'Paint Finish Defect',
    stage: 'Gate 2: Paint & Surface Inspection',
    description: 'Orange peel texture and slight solvent pop on right side upper window panel.',
    severity: 'Minor',
    rootCause: 'Flash-off time between coat 1 and coat 2 was 4 minutes instead of required 10 minutes.',
    correctiveAction: 'Wet-sanded with P1500 abrasive, compounded with high-cut foam pad, and polished.',
    status: 'RESOLVED',
    reportedBy: 'C. Moyo',
    reportedDate: '2026-09-26',
    resolvedDate: '2026-09-27',
    zone: 'Right Side',
    pinX: 58,
    pinY: 34,
  },
  {
    id: 'DEF-04',
    busNo: 'AVM-2026-09',
    code: 'P-03',
    codeName: 'Surface Orange Peel',
    stage: 'Gate 2: Paint & Surface Inspection',
    description: 'Heavy waviness and orange peel texture on rear tail cap below destination sign.',
    severity: 'Major',
    rootCause: 'Gun air pressure too low (1.4 bar instead of 2.0 bar) resulting in poor paint atomization.',
    correctiveAction: 'Reset SATA HVLP gun regulator to 2.0 bar at nozzle. Sand back and re-clear.',
    status: 'OPEN',
    reportedBy: 'T. Sibanda',
    reportedDate: '2026-09-28',
    zone: 'Rear Cap',
    pinX: 92,
    pinY: 50,
  },
];

const DEFAULT_FEEDBACK: FeedbackItem[] = [
  {
    id: 'FDB-01',
    source: 'Driver',
    busModel: 'City Commuter 65-Seat',
    category: 'Ergonomics',
    feedbackText: 'Driver seat steering column angle causes wrist fatigue after 6 continuous hours on urban routes.',
    actionTaken: 'Adopted adjustable pneumatic tilt steering bracket into Standard Options Matrix Rev 3.',
    status: 'IMPLEMENTED_IN_REV',
    date: '2026-08-14',
  },
  {
    id: 'FDB-02',
    source: 'Mechanic',
    busModel: 'Heavy Duty Rural 60-Seat',
    category: 'Maintenance',
    feedbackText: 'Fuel filter bracket is positioned too close to the main suspension spring pack, making tool access difficult.',
    actionTaken: 'Relocated fuel filter bracket 150mm inboard on Drawing AVM-STR-2026-01 Rev 4.2.',
    status: 'IMPLEMENTED_IN_REV',
    date: '2026-08-28',
  },
  {
    id: 'FDB-03',
    source: 'Fleet Owner',
    busModel: 'Intercity Express 52-Seat',
    category: 'Paint & Finish',
    feedbackText: 'Lighter blue metallic paint shows premature rock-chip pitting on front radiator cowl after 50,000km gravel service.',
    actionTaken: 'Added ceramic-reinforced anti-stone chip polyurethane clearcoat to front nose cone in paint specification.',
    status: 'PENDING_REVIEW',
    date: '2026-09-15',
  },
];

const DEFAULT_STOCK: MaterialStockItem[] = [
  {
    id: 'STK-01',
    code: 'RHS-100X50X3',
    name: 'Rectangular Hollow Steel (100x50x3mm)',
    category: 'Steel & Frame',
    unit: 'Lengths (6m)',
    currentStock: 18,
    minLevel: 25, // LOW STOCK TRIGGER
    maxLevel: 100,
    unitCostUsd: 42.5,
    storageBin: 'Rack 1A',
    supplier: 'Zisco Steel Ltd',
    storageZone: 'Yard Cantilever Racks',
    locationCode: 'YARD-CANT-04-A',
    batchLotNo: 'HEAT-9842-350WA',
    kanbanCardStatus: 'REORDER_TRIGGERED',
  },
  {
    id: 'STK-02',
    code: 'GLV-1.2MM-SHT',
    name: 'Galvaneal Exterior Body Sheet (1.2mm x 1.2m x 2.4m)',
    category: 'Panels & Cladding',
    unit: 'Sheets',
    currentStock: 44,
    minLevel: 30,
    maxLevel: 150,
    unitCostUsd: 28.0,
    storageBin: 'Plate Bay B',
    supplier: 'Midlands Steel Processing',
    storageZone: 'Sheet Metal Leaf Racks',
    locationCode: 'SHEET-RACK-02-B',
    batchLotNo: 'LOT-2026-GLV12',
    kanbanCardStatus: 'BIN_1_FULL',
  },
  {
    id: 'STK-03',
    code: 'PNT-2K-WHT-9010',
    name: '2K Polyurethane White Paint (RAL-9010 Pure White)',
    category: 'Paints & Primers',
    unit: 'Liters',
    currentStock: 12,
    minLevel: 35, // LOW STOCK TRIGGER
    maxLevel: 120,
    unitCostUsd: 14.5,
    storageBin: 'Paint Store Cabinet 1',
    supplier: 'Astra Paints Zimbabwe',
    storageZone: 'ATEX Paint Mix Room',
    locationCode: 'PAINT-ATEX-C1',
    batchLotNo: 'ASTRA-9010-B4',
    expiryDate: '2027-04-15',
    tempControlled: true,
    storageTempC: '19.8°C (Humidity 52%)',
    kanbanCardStatus: 'REORDER_TRIGGERED',
  },
  {
    id: 'STK-04',
    code: 'PNT-2K-BLU-5010',
    name: '2K Polyurethane Gentian Blue (RAL-5010)',
    category: 'Paints & Primers',
    unit: 'Liters',
    currentStock: 50,
    minLevel: 20,
    maxLevel: 80,
    unitCostUsd: 16.0,
    storageBin: 'Paint Store Cabinet 2',
    supplier: 'Astra Paints Zimbabwe',
    storageZone: 'ATEX Paint Mix Room',
    locationCode: 'PAINT-ATEX-C2',
    batchLotNo: 'ASTRA-5010-B1',
    expiryDate: '2027-03-30',
    tempControlled: true,
    storageTempC: '19.8°C (Humidity 52%)',
    kanbanCardStatus: 'BIN_1_FULL',
  },
  {
    id: 'STK-05',
    code: 'RVT-MONOBOLT-6.4',
    name: 'High-Tensile Structural Monobolts (6.4mm)',
    category: 'Hardware & Fasteners',
    unit: 'Boxes (1,000 pcs)',
    currentStock: 6,
    minLevel: 10, // LOW STOCK TRIGGER
    maxLevel: 40,
    unitCostUsd: 85.0,
    storageBin: 'Hardware Bin 4C',
    supplier: 'Industrial Fasteners Harare',
    storageZone: 'Fastener Aisle',
    locationCode: 'AISLE-03-BIN-14',
    batchLotNo: 'HUCK-MB-64',
    kanbanCardStatus: 'REORDER_TRIGGERED',
  },
  {
    id: 'STK-06',
    code: 'SEAL-PU-GREY',
    name: 'Sikaflex-252 Polyurethane Structural Adhesive',
    category: 'Paints & Primers',
    unit: 'Cartridges (310ml)',
    currentStock: 85,
    minLevel: 40,
    maxLevel: 200,
    unitCostUsd: 5.2,
    storageBin: 'Chemical Vault Bay',
    supplier: 'Sika Chemicals Africa',
    storageZone: 'Bonding & Adhesive Vault',
    locationCode: 'BOND-VAULT-01',
    batchLotNo: 'SIKA-252-0926',
    expiryDate: '2027-02-28',
    tempControlled: true,
    storageTempC: '20.5°C',
    kanbanCardStatus: 'BIN_1_FULL',
  },
  {
    id: 'STK-07',
    code: 'GLS-WINDSHIELD-CURV',
    name: 'Laminated Toughened Curved Windscreen (UN ECE R43)',
    category: 'Glass & Glazing',
    unit: 'Units',
    currentStock: 14,
    minLevel: 8,
    maxLevel: 30,
    unitCostUsd: 310.0,
    storageBin: 'A-Frame Trolley 02',
    supplier: 'National Glass Bulawayo',
    storageZone: 'Glass A-Frame',
    locationCode: 'GLAZING-AFRAME-02',
    batchLotNo: 'ECE-R43-2026',
    kanbanCardStatus: 'BIN_1_FULL',
  },
  {
    id: 'STK-08',
    code: 'SEAT-HD-VINYL-BLUE',
    name: '3+2 Anti-Vandal Urban Commuter Seat Unit with M10 Bolts',
    category: 'Upholstery',
    unit: 'Double Units',
    currentStock: 32,
    minLevel: 20,
    maxLevel: 90,
    unitCostUsd: 78.0,
    storageBin: 'Mezzanine Bin M3',
    supplier: 'Harare Coach Trimmers',
    storageZone: 'Trim Mezzanine',
    locationCode: 'MEZZ-RACK-03-A',
    batchLotNo: 'TRIM-65COMM-26',
    kanbanCardStatus: 'BIN_1_FULL',
  },
];

const DEFAULT_OPTIONS: StandardOptionItem[] = [
  {
    category: 'Seating Layout',
    optionCode: 'SEAT-2X2-EXEC',
    name: '2+2 High-Back Executive Reclining',
    description: '52-passenger capacity with individual reading lamps, armrests, and foot rests.',
    standardLeadTimeDays: 0,
    costDeltaUsd: 1800,
    isPopular: true,
  },
  {
    category: 'Seating Layout',
    optionCode: 'SEAT-3X2-COMM',
    name: '3+2 Heavy-Duty Urban Commuter',
    description: '65-passenger capacity with tubular steel vandal-resistant frames and vinyl upholstery.',
    standardLeadTimeDays: 0,
    costDeltaUsd: 0,
    isPopular: true,
  },
  {
    category: 'Interior Trim',
    optionCode: 'TRM-VINYL-HVY',
    name: 'Commercial Heavy-Duty Embossed Vinyl',
    description: 'Easy-wash sanitized vinyl with 5-year anti-cracking warranty in tropical climate.',
    standardLeadTimeDays: 0,
    costDeltaUsd: 0,
    isPopular: true,
  },
  {
    category: 'Interior Trim',
    optionCode: 'TRM-FABRIC-LUX',
    name: 'Plush Jacquard Upholstery with Scotchgard',
    description: 'Flame-retardant stain-resistant woven automotive fabric.',
    standardLeadTimeDays: 5,
    costDeltaUsd: 950,
    isPopular: false,
  },
  {
    category: 'Powertrain',
    optionCode: 'PWR-DAF-TURBO',
    name: 'DAF 6-Cylinder Turbocharged Diesel Euro III',
    description: 'Mechanical injection system optimized for African regional high-sulfur diesel fuel.',
    standardLeadTimeDays: 0,
    costDeltaUsd: 0,
    isPopular: true,
  },
  {
    category: 'Climate Control',
    optionCode: 'HVAC-TROPICAL-45',
    name: 'Heavy-Duty 45kW Tropical Rooftop AC Unit',
    description: 'Engine-driven condenser with anti-corrosion condenser fins and dual high-flow blowers.',
    standardLeadTimeDays: 7,
    costDeltaUsd: 4200,
    isPopular: true,
  },
];

// Helper to safely load or initialize data
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`avm_${key}`);
    if (!raw) {
      localStorage.setItem(`avm_${key}`, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`LocalStorage failed for avm_${key}, falling back to default`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`avm_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to save to localStorage for avm_${key}`, e);
  }
}

function sanitizeImageUrl(url?: string): string | undefined {
  if (!url) return url;
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/images/');
  }
  return url;
}

export const StorageService = {
  getBuses: (): BusProductionItem[] => loadFromStorage('buses', DEFAULT_BUSES),
  saveBuses: (items: BusProductionItem[]) => saveToStorage('buses', items),

  getDrawings: (): DrawingItem[] => {
    const list = loadFromStorage('drawings', DEFAULT_DRAWINGS);
    return list.map((item) => {
      const match = DEFAULT_DRAWINGS.find((def) => def.drawingNo === item.drawingNo || def.id === item.id);
      const rawUrl = sanitizeImageUrl(item.drawingImageUrl) || (match ? match.drawingImageUrl : undefined);
      if (match) {
        return {
          ...match,
          ...item,
          drawingImageUrl: rawUrl,
          reviewNotes: item.reviewNotes || match.reviewNotes,
          leadReviewer: item.leadReviewer || match.leadReviewer,
          leadReviewerRole: match.leadReviewerRole,
          latestReviewDate: match.latestReviewDate,
          reviewVerdict: match.reviewVerdict,
          reviewCode: match.reviewCode,
          standardsCompliance: match.standardsCompliance,
          criticalTolerances: match.criticalTolerances,
          designRationale: match.designRationale,
          changeHistory: match.changeHistory,
          reviewComments: match.reviewComments,
        };
      }
      return {
        ...item,
        drawingImageUrl: rawUrl,
      };
    });
  },
  saveDrawings: (items: DrawingItem[]) => saveToStorage('drawings', items),

  getCheckpoints: (): QualityCheckpointItem[] => loadFromStorage('checkpoints', DEFAULT_CHECKPOINTS),
  saveCheckpoints: (items: QualityCheckpointItem[]) => saveToStorage('checkpoints', items),

  getDefects: (): DefectItem[] => loadFromStorage('defects', DEFAULT_DEFECTS),
  saveDefects: (items: DefectItem[]) => saveToStorage('defects', items),

  getFeedback: (): FeedbackItem[] => loadFromStorage('feedback', DEFAULT_FEEDBACK),
  saveFeedback: (items: FeedbackItem[]) => saveToStorage('feedback', items),

  getStock: (): MaterialStockItem[] => loadFromStorage('stock', DEFAULT_STOCK),
  saveStock: (items: MaterialStockItem[]) => saveToStorage('stock', items),

  getOptions: (): StandardOptionItem[] => loadFromStorage('options', DEFAULT_OPTIONS),

  // Reset to factory defaults
  resetAll: () => {
    localStorage.removeItem('avm_buses');
    localStorage.removeItem('avm_drawings');
    localStorage.removeItem('avm_checkpoints');
    localStorage.removeItem('avm_defects');
    localStorage.removeItem('avm_feedback');
    localStorage.removeItem('avm_stock');
    localStorage.removeItem('avm_options');
    window.location.reload();
  },
};
