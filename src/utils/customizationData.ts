/**
 * NESARI 2026 | National Finals
 * AVM Africa: Late-Stage Customization Solution Architecture (Solution B Aligned)
 * Friday, 9 October 2026, Great Zimbabwe University, Masvingo
 */

export type FreezeGateId = 'G1' | 'G2' | 'G3' | 'G4';

export interface FreezeGateDef {
  id: FreezeGateId;
  name: string;
  timing: string;
  lockedScope: string;
  affectedShops: string[];
  latePremiumUsd: number;
  holdingDaysDelayPenalty: number;
  description: string;
  reworkRiskIfBreached: string;
}

export const FREEZE_GATES: FreezeGateDef[] = [
  {
    id: 'G1',
    name: 'Gate 1: Structural Freeze',
    timing: 'Before Frames (Stage 3)',
    lockedScope: 'Chassis ladder length, outrigger spacing, axle positions, passenger door aperture',
    affectedShops: ['Chassis Shop', 'Structural Welding Bay', 'Jig Assembly'],
    latePremiumUsd: 250,
    holdingDaysDelayPenalty: 2,
    description: 'Any change after G1 requires cutting welded structural steel and re-jigging.',
    reworkRiskIfBreached: 'Requires cutting 50x50 RHS steel tubing, structural re-certification, and jig recalibration.',
  },
  {
    id: 'G2',
    name: 'Gate 2: Exterior Body & Fibre Freeze',
    timing: 'Before Coach Building / Fibre Moulding (Stage 4)',
    lockedScope: 'Exterior skin panels, front nose cone fascia, rear taillight apertures, roof crown',
    affectedShops: ['Fibre Moulding Bay', 'Coach Building', 'Sheet Metal Skinning'],
    latePremiumUsd: 450,
    holdingDaysDelayPenalty: 3,
    description: 'Locks FRP fibreglass mouldings and sheet metal skin cuts to prevent mould re-tooling.',
    reworkRiskIfBreached: 'Destroys 2.4m x 1.8m multi-meter fibre master plug; risks 6-day line stall if unmodularized.',
  },
  {
    id: 'G3',
    name: 'Gate 3: Interior Trim & Glazing Freeze',
    timing: 'Before Trimming & Window Section (Stage 5)',
    lockedScope: 'Passenger seat layout, vinyl fabric, window glazing tint, parcel racks',
    affectedShops: ['Trimming & Upholstery', 'Window Glazing Bay', 'Interior Wiring'],
    latePremiumUsd: 750,
    holdingDaysDelayPenalty: 2,
    description: 'Locks upholstery sewing patterns and glass cutting before adhesives and fasteners are applied.',
    reworkRiskIfBreached: 'Wasted Sikaflex polyurethane adhesive cure, ruined pre-stitched vinyl seat covers.',
  },
  {
    id: 'G4',
    name: 'Gate 4: Colour & Livery Freeze',
    timing: 'Before Paint Shop (Stage 5/6)',
    lockedScope: 'Basecoat RAL colors, fleet vinyl decals, 2K polyurethane topcoat formulation',
    affectedShops: ['Paint Spray Booth', 'Baking Oven', 'Decal & Finishing'],
    latePremiumUsd: 1200,
    holdingDaysDelayPenalty: 4,
    description: 'Locks paint mixing batches and booth masking schedules. Prevents wasted mixed 2K paint.',
    reworkRiskIfBreached: 'Mixed 2K isocyanate paint pot-life expires in 4 hours; complete booth re-masking required.',
  },
];

export interface ChangeOrderRecord {
  id: string;
  busNo: string;
  customer: string;
  title: string;
  changeCategory: 'Taillight Aperture' | 'Executive Seating' | 'Front Fascia VIP' | 'Tinted Glazing' | 'Special Livery';
  requestedAtStage: string;
  gatePassed: FreezeGateId;
  description: string;
  materialsCostUsd: number;
  extraLabourHours: number;
  labourRatePerHour: number;
  outsourcingCostUsd: number;
  delayDays: number;
  dailyHoldingCostUsd: number;
  lateGatePremiumUsd: number;
  totalCalculatedCostUsd: number;
  originalDeliveryDate: string;
  revisedDeliveryDate: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'IN_PRODUCTION' | 'REJECTED';
  qrTurnedRed: boolean;
  stopIssueSignalSent: boolean;
  storesBomOverridden: boolean;
  resequencingTriggered: boolean;
  pulledForwardBusNo?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface SkillMatrixOperator {
  id: string;
  name: string;
  primaryRole: string;
  skills: {
    fibreLaminating: number; // 1 to 5
    migWelding: number;
    electricalHarness: number;
    trimmingUpholstery: number;
    glazingFitting: number;
    paintSpraying: number;
  };
  backupFor: string[];
}

export const INITIAL_SKILL_MATRIX: SkillMatrixOperator[] = [
  {
    id: 'OP-01',
    name: 'K. Shumba',
    primaryRole: 'Lead Fibre Laminator',
    skills: {
      fibreLaminating: 5,
      migWelding: 2,
      electricalHarness: 1,
      trimmingUpholstery: 2,
      glazingFitting: 3,
      paintSpraying: 3,
    },
    backupFor: ['D. Ncube (Coach Framing)'],
  },
  {
    id: 'OP-02',
    name: 'T. Sibanda',
    primaryRole: 'Cross-Trained Backup Laminator & Glazing Tech',
    skills: {
      fibreLaminating: 4, // Cross-trained! Solves sole laminator bottleneck!
      migWelding: 3,
      electricalHarness: 2,
      trimmingUpholstery: 2,
      glazingFitting: 5,
      paintSpraying: 3,
    },
    backupFor: ['K. Shumba (Fibre Shop)', 'E. Sithole (Glazing)'],
  },
  {
    id: 'OP-03',
    name: 'C. Moyo',
    primaryRole: 'MIG Welder & Jig Specialist',
    skills: {
      fibreLaminating: 2,
      migWelding: 5,
      electricalHarness: 2,
      trimmingUpholstery: 1,
      glazingFitting: 3,
      paintSpraying: 2,
    },
    backupFor: ['M. Zondo (Chassis Fab)'],
  },
  {
    id: 'OP-04',
    name: 'E. Sibanda',
    primaryRole: 'Automotive Electrician & Loom Tech',
    skills: {
      fibreLaminating: 1,
      migWelding: 2,
      electricalHarness: 5,
      trimmingUpholstery: 2,
      glazingFitting: 2,
      paintSpraying: 1,
    },
    backupFor: ['P. Choto (PDI Diagnostics)'],
  },
  {
    id: 'OP-05',
    name: 'P. Dlamini',
    primaryRole: 'Master Coach Trimmer & Upholsterer',
    skills: {
      fibreLaminating: 2,
      migWelding: 1,
      electricalHarness: 2,
      trimmingUpholstery: 5,
      glazingFitting: 3,
      paintSpraying: 2,
    },
    backupFor: ['T. Sibanda (Trimming Finishing)'],
  },
];

export interface CustomizationParetoStat {
  category: string;
  requestFrequencyPercent: number;
  cumulativePercent: number;
  avgCostImpactUsd: number;
  standardCatalogSolution: string;
}

export const CUSTOMIZATION_PARETO_DATA: CustomizationParetoStat[] = [
  {
    category: 'Taillight Bezel Aperture',
    requestFrequencyPercent: 38,
    cumulativePercent: 38,
    avgCostImpactUsd: 1450,
    standardCatalogSolution: 'Modular Rear Panel with Universal Recess & $75 Bezel Inserts',
  },
  {
    category: 'Passenger Seating Recline & Layout',
    requestFrequencyPercent: 26,
    cumulativePercent: 64,
    avgCostImpactUsd: 850,
    standardCatalogSolution: 'Pre-Engineered Floor Track Grid (M10 Universal Rail Spacing)',
  },
  {
    category: 'Front Fascia VIP Grille & Headlights',
    requestFrequencyPercent: 18,
    cumulativePercent: 82,
    avgCostImpactUsd: 1800,
    standardCatalogSolution: 'Interchangeable FRP Nose Cone Bolt-On Sub-Assembly',
  },
  {
    category: 'Window Glazing Tint & Sliding Vents',
    requestFrequencyPercent: 12,
    cumulativePercent: 94,
    avgCostImpactUsd: 620,
    standardCatalogSolution: 'Universal ECE R43 Glazing Frame Dimensions',
  },
  {
    category: 'Special Fleet Two-Tone Livery Masking',
    requestFrequencyPercent: 6,
    cumulativePercent: 100,
    avgCostImpactUsd: 480,
    standardCatalogSolution: 'Pre-Cut CNC Vinyl Graphic Templates with Standard RAL Base',
  },
];

export interface TaillightModularConfig {
  styleId: 'TRIPLE_ROUND' | 'VERTICAL_LIGHTBAR' | 'DYNAMIC_ARROW';
  name: string;
  targetFleet: string;
  insertCostUsd: number;
  fasteners: string;
  gasketSpec: string;
  wiringHarness: string;
  installTimeMinutes: number;
  oldMethodCostUsd: number;
  oldMethodDelayDays: number;
}

export const TAILLIGHT_MODULAR_CONFIGS: Record<string, TaillightModularConfig> = {
  TRIPLE_ROUND: {
    styleId: 'TRIPLE_ROUND',
    name: 'Config A: Triple Round LED Bezel Insert',
    targetFleet: 'ZUPCO & Urban Municipal Commuters',
    insertCostUsd: 65,
    fasteners: '4x M6 Stainless Torx Security Screws with Nylon Washers',
    gasketSpec: 'Continuous 3.5mm EPDM closed-cell foam compression seal (IP67)',
    wiringHarness: 'Universal Deutsch DT 6-Way Sealed Automotive Connector',
    installTimeMinutes: 25,
    oldMethodCostUsd: 3800, // Re-moulding fibre panel
    oldMethodDelayDays: 5,
  },
  VERTICAL_LIGHTBAR: {
    styleId: 'VERTICAL_LIGHTBAR',
    name: 'Config B: Modern Vertical Lightbar Bezel Insert',
    targetFleet: 'Falcon Safari Express & Cross-Border Coaches',
    insertCostUsd: 85,
    fasteners: '6x M6 Stainless Torx Security Screws into Brass Blind Inserts',
    gasketSpec: 'Continuous 3.5mm EPDM closed-cell foam compression seal (IP67)',
    wiringHarness: 'Universal Deutsch DT 6-Way Sealed Automotive Connector',
    installTimeMinutes: 35,
    oldMethodCostUsd: 4400,
    oldMethodDelayDays: 6,
  },
  DYNAMIC_ARROW: {
    styleId: 'DYNAMIC_ARROW',
    name: 'Config C: Dynamic Arrow Touring Bezel Insert',
    targetFleet: 'Victoria Falls Shuttle & VIP Private Charters',
    insertCostUsd: 95,
    fasteners: '6x M6 Stainless Torx Security Screws into Brass Blind Inserts',
    gasketSpec: 'Dual-lip EPDM silicone perimeter bulb seal (IP67)',
    wiringHarness: 'Universal Deutsch DT 6-Way Sealed Automotive Connector',
    installTimeMinutes: 30,
    oldMethodCostUsd: 4900,
    oldMethodDelayDays: 6,
  },
};

export const INITIAL_CHANGE_ORDERS: ChangeOrderRecord[] = [
  {
    id: 'CHG-2026-001',
    busNo: 'AVM-2026-09',
    customer: 'Falcon Safari Express',
    title: 'Custom Vertical LED Taillight Cluster (The Landmark Case)',
    changeCategory: 'Taillight Aperture',
    requestedAtStage: 'Stage 4: Coach Building',
    gatePassed: 'G2',
    description: 'Customer requested luxury vertical lightbars instead of standard triple round lights after fibre moulding had begun.',
    materialsCostUsd: 85, // Modular insert cost vs $1800 re-moulding!
    extraLabourHours: 2.5,
    labourRatePerHour: 20,
    outsourcingCostUsd: 0, // In-house modular bezel vs $1800 emergency outsourcing!
    delayDays: 0, // Pull-scheduling prevented line halt!
    dailyHoldingCostUsd: 600,
    lateGatePremiumUsd: 450, // Gate G2 premium
    totalCalculatedCostUsd: 585,
    originalDeliveryDate: '2026-10-12',
    revisedDeliveryDate: '2026-10-12', // Protected!
    status: 'APPROVED',
    qrTurnedRed: true,
    stopIssueSignalSent: true,
    storesBomOverridden: true,
    resequencingTriggered: true,
    pulledForwardBusNo: 'AVM-2026-10',
    approvedBy: 'G. Chiwara (Commercial Director)',
    approvedDate: '2026-09-18',
  },
  {
    id: 'CHG-2026-002',
    busNo: 'AVM-2026-07',
    customer: 'Bulawayo Transit Corp',
    title: 'Upgraded Heavy-Duty USB Passenger Charging Ports',
    changeCategory: 'Executive Seating',
    requestedAtStage: 'Stage 5: Finishing',
    gatePassed: 'G3',
    description: 'Addition of dual 2.4A USB ports to every passenger seat row with dedicated auxiliary fuse block.',
    materialsCostUsd: 320,
    extraLabourHours: 8,
    labourRatePerHour: 18,
    outsourcingCostUsd: 0,
    delayDays: 1,
    dailyHoldingCostUsd: 600,
    lateGatePremiumUsd: 750, // Gate G3 premium
    totalCalculatedCostUsd: 1814,
    originalDeliveryDate: '2026-09-30',
    revisedDeliveryDate: '2026-10-01',
    status: 'APPROVED',
    qrTurnedRed: true,
    stopIssueSignalSent: true,
    storesBomOverridden: true,
    resequencingTriggered: false,
    approvedBy: 'C. Moyo (Plant QA)',
    approvedDate: '2026-09-08',
  },
];

// ==========================================
// SOLUTION B - SECTION 3.2: UNIVERSAL MOUNTING BRACKETS (COMPONENTS PRODUCTION)
// ==========================================
export interface UniversalBracketSpec {
  id: string;
  partNumber: string;
  name: string;
  shopProduced: string;
  material: string;
  sheetGauge: string;
  manufacturingProcess: string;
  unitCostUsd: number;
  flowValidationStatus: 'VALIDATED_IN_FLOW' | 'PENDING_SITE_CONFIRM';
  purpose: string;
  leadTimeHours: number;
}

export const UNIVERSAL_BRACKETS: UniversalBracketSpec[] = [
  {
    id: 'UB-01',
    partNumber: 'AVM-CMP-BKT-01',
    name: 'Universal Taillight Bezel Frame Adaptor',
    shopProduced: 'Components Production (Press & Shear Bay)',
    material: 'Grade 304 Stainless Steel / 2.0mm Mild Steel powder-coated',
    sheetGauge: '2.0mm CNC Laser Cut & Press-Brake Folded',
    manufacturingProcess: 'Slotted hole matrix matching both vertical lightbar and triple round mounts',
    unitCostUsd: 14.5,
    flowValidationStatus: 'VALIDATED_IN_FLOW',
    purpose: 'Allows any bezel insert to bolt onto rear coach uprights without modifying chassis welding.',
    leadTimeHours: 1.5,
  },
  {
    id: 'UB-02',
    partNumber: 'AVM-CMP-BKT-02',
    name: 'Universal Seat Stanchion Floor Rail Adaptor',
    shopProduced: 'Components Production (Tube Bending & Milling)',
    material: 'Cold Drawn Seamless Steel 32mm OD',
    sheetGauge: '3.0mm wall thickness with laser-cut mounting tabs',
    manufacturingProcess: 'Standardized M10 T-slot bracket compatible with standard and VIP reclining seats',
    unitCostUsd: 18.0,
    flowValidationStatus: 'VALIDATED_IN_FLOW',
    purpose: 'Enables custom seating pitch (2+2 or 2+1 layout) without drilling fresh floor holes.',
    leadTimeHours: 2.0,
  },
  {
    id: 'UB-03',
    partNumber: 'AVM-CMP-BKT-03',
    name: 'Universal Front Bumper / Fog Light Carrier',
    shopProduced: 'Components Production (Welded Sub-Assembly)',
    material: 'Q235 Structural Steel, hot-dip galvanized',
    sheetGauge: '4.0mm heavy gauge gusseted plate',
    manufacturingProcess: 'Dual slotted hinge pins for quick nose cone fascia swap',
    unitCostUsd: 26.5,
    flowValidationStatus: 'PENDING_SITE_CONFIRM',
    purpose: 'Accommodates round fog lamps, LED lightbars, or bullbars without frame alterations.',
    leadTimeHours: 3.5,
  },
];

// ==========================================
// SOLUTION B - SECTION 3.3: CUSTOMER SIGN-OFF & 3D RENDER APPROVAL PACK
// ==========================================
export interface CustomizationOptionMenu {
  id: string;
  category: 'Lighting' | 'Seating' | 'Interior Trim & Glazing' | 'Livery & Paint';
  optionA: { name: string; costUsd: number; leadTimeDays: number; description: string };
  optionB: { name: string; costUsd: number; leadTimeDays: number; description: string };
  optionC: { name: string; costUsd: number; leadTimeDays: number; description: string };
}

export const CUSTOMIZATION_MENU: CustomizationOptionMenu[] = [
  {
    id: 'OPT-LGT',
    category: 'Lighting',
    optionA: {
      name: 'Standard Municipal Triple Round LEDs',
      costUsd: 0,
      leadTimeDays: 0,
      description: 'Durable IP67 polycarbonate round cluster with universal Deutsch 6-way plug.',
    },
    optionB: {
      name: 'Intercity Vertical LED Lightbar Bezel',
      costUsd: 220,
      leadTimeDays: 2,
      description: 'Streamlined vertical neon-glow light guides with integrated reversing matrix.',
    },
    optionC: {
      name: 'VIP Dynamic Arrow Sequential Indicators',
      costUsd: 380,
      leadTimeDays: 3,
      description: 'Audi-style sweeping amber turn signals with smoked acrylic styling bezel.',
    },
  },
  {
    id: 'OPT-SEAT',
    category: 'Seating',
    optionA: {
      name: 'High-Density Commuter Vinyl (65-Pass)',
      costUsd: 0,
      leadTimeDays: 0,
      description: 'Heavy duty wipe-clean vinyl with steel grab handles and fixed backs.',
    },
    optionB: {
      name: 'Semi-Recline Luxury Velour (55-Pass)',
      costUsd: 850,
      leadTimeDays: 4,
      description: 'Contoured dual-density foam, 25° pneumatic recline, armrests, and footrests.',
    },
    optionC: {
      name: 'VIP Executive 2+1 Leather Sleeper (36-Pass)',
      costUsd: 2200,
      leadTimeDays: 7,
      description: 'Full grain bonded leather, 140° business recline, USB charging, reading spotlight.',
    },
  },
  {
    id: 'OPT-GLZ',
    category: 'Interior Trim & Glazing',
    optionA: {
      name: 'Clear Toughened ECE R43 with Top Sliders',
      costUsd: 0,
      leadTimeDays: 0,
      description: 'Natural airflow split windows with heavy-duty rubber weatherstrip seal.',
    },
    optionB: {
      name: 'Smoked Green Tint Privacy Glazing',
      costUsd: 350,
      leadTimeDays: 2,
      description: '25% light transmission with solar thermal reduction film.',
    },
    optionC: {
      name: 'Double Glazed Panoramic Flush Bonded Glass',
      costUsd: 1100,
      leadTimeDays: 5,
      description: 'Direct polyurethane bonded aerodynamic glass with superior acoustic insulation.',
    },
  },
  {
    id: 'OPT-LIV',
    category: 'Livery & Paint',
    optionA: {
      name: 'Standard Fleet Monotone (AVM White RAL 9016)',
      costUsd: 0,
      leadTimeDays: 0,
      description: 'High solids 2K acrylic polyurethane single bake finish.',
    },
    optionB: {
      name: 'Two-Tone Metallic Line Split with Clearcoat',
      costUsd: 650,
      leadTimeDays: 2,
      description: 'Dual masking with metallic pearl roof crown and deep blue side panels.',
    },
    optionC: {
      name: 'Full Custom Fleet Vinyl Wrap & Multi-Stage Livery',
      costUsd: 1450,
      leadTimeDays: 4,
      description: 'Cast 7-year polymeric vinyl graphics with 3M edge sealing and protective lacquer.',
    },
  },
];

export interface GateRenderApproval {
  gateId: FreezeGateId;
  stageName: string;
  assetTitle: string;
  renderType: '3D CAD Model' | 'Physical Mock-Up' | 'Trim & Color Swatch' | 'Full Digital Twin';
  status: 'APPROVED' | 'PENDING_CLIENT_SIGN' | 'REVISED_REQUIRED';
  clientApprover: string;
  signedDate: string;
  toleranceConfirmed: string;
  renderImageUrl: string;
}

export const GATE_RENDER_APPROVALS: GateRenderApproval[] = [
  {
    gateId: 'G1',
    stageName: 'Gate 1: Before Structural Frames',
    assetTitle: 'Chassis Layout & Door Aperture 3D Render',
    renderType: '3D CAD Model',
    status: 'APPROVED',
    clientApprover: 'J. Moyo (Fleet Engineer, Falcon)',
    signedDate: '2026-09-02',
    toleranceConfirmed: 'Overall length 12,500mm ± 2mm · Front axle datum confirmed',
    renderImageUrl: 'cad-render-chassis.png',
  },
  {
    gateId: 'G2',
    stageName: 'Gate 2: Before Fibre Moulding & Coach Building',
    assetTitle: 'Rear Panel Universal Recess & Bezel Insert Mock-Up',
    renderType: 'Physical Mock-Up',
    status: 'APPROVED',
    clientApprover: 'K. Chikwanha (Operations Director)',
    signedDate: '2026-09-14',
    toleranceConfirmed: 'Scale 1:1 CNC Rapid Prototype Bezel · Gasket seal compression validated',
    renderImageUrl: 'cad-render-taillight.png',
  },
  {
    gateId: 'G3',
    stageName: 'Gate 3: Before Trimming & Glazing',
    assetTitle: 'Passenger Saloon 3D Render & Upholstery Swatch Pack',
    renderType: 'Trim & Color Swatch',
    status: 'APPROVED',
    clientApprover: 'R. Ndlovu (Procurement Lead)',
    signedDate: '2026-09-22',
    toleranceConfirmed: '750mm seat pitch · Flame-retardant test certificate FMVSS 302',
    renderImageUrl: 'cad-render-interior.png',
  },
  {
    gateId: 'G4',
    stageName: 'Gate 4: Before Paint Shop',
    assetTitle: '2K Polyurethane Livery 3D Render & Spray-Out Sample Card',
    renderType: 'Full Digital Twin',
    status: 'PENDING_CLIENT_SIGN',
    clientApprover: 'Awaiting Final Livery Sign-Off',
    signedDate: 'Pending',
    toleranceConfirmed: 'RAL 5002 Ultramarine Blue + RAL 9016 White · Delta-E ≤ 1.2 target',
    renderImageUrl: 'cad-render-paint.png',
  },
];

// ==========================================
// SOLUTION B - SECTION 3.4: THIRD-PARTY & BACKUP QA TOOLKIT
// ==========================================
export interface VisualSopStep {
  stepNo: number;
  title: string;
  parameter: string;
  standardValue: string;
  criticalQualityPoint: string;
  bayLocation: string;
}

export const FIBRE_MOULDING_VISUAL_SOP: VisualSopStep[] = [
  {
    stepNo: 1,
    title: 'Wax & Mould Release Preparation',
    parameter: 'Carnauba Release Wax',
    standardValue: '3 Buffed coats + PVA liquid film',
    criticalQualityPoint: 'Ensure complete drying of PVA before spraying gelcoat to prevent surface blistering.',
    bayLocation: 'Moulding Bay #1 (Fibre Shop)',
  },
  {
    stepNo: 2,
    title: 'Tooling Gelcoat Application',
    parameter: 'Isophthalic Gelcoat Thickness',
    standardValue: '0.50mm – 0.65mm (500 – 650 microns wet film gauge)',
    criticalQualityPoint: 'Under-thickness causes alligatoring; over-thickness leads to impact cracking.',
    bayLocation: 'Moulding Bay #1',
  },
  {
    stepNo: 3,
    title: 'Resin & Catalyst Mixing Ratio',
    parameter: 'MEKP (Methyl Ethyl Ketone Peroxide)',
    standardValue: '1.5% to 2.0% by weight of orthophthalic polyester resin',
    criticalQualityPoint: 'At 25°C ambient: 1.8% MEKP gives 22 min gel time. Over-catalysing causes thermal warping.',
    bayLocation: 'ATEX Chemical Mix Vault',
  },
  {
    stepNo: 4,
    title: 'Ply Layering Schedule',
    parameter: 'Reinforcement Glass Mat Sequence',
    standardValue: 'Layer 1: 300g CSM → Layer 2: 450g CSM → Layer 3: 600g Woven Roving → Layer 4: 450g CSM',
    criticalQualityPoint: 'Consolidate each layer with grooved aluminium bubble roller to eliminate entrapped voids.',
    bayLocation: 'Lamination Platform',
  },
  {
    stepNo: 5,
    title: 'De-Mould & Post-Cure Timing',
    parameter: 'Ambient Cure & Exotherm Peak',
    standardValue: 'Minimum 4.0 hours mould dwell time; full Barcol hardness achieved at 24 hours @ 22°C+',
    criticalQualityPoint: 'Never de-mould before Barcol hardness reaches minimum 25 to prevent permanent sag.',
    bayLocation: 'Curing Bay',
  },
];

export interface SupplierQualificationItem {
  id: string;
  category: string;
  requirement: string;
  weightPercent: number;
  checked: boolean;
  notes: string;
}

export const SUPPLIER_QUALIFICATION_CHECKLIST: SupplierQualificationItem[] = [
  {
    id: 'SQ-01',
    category: 'Quality Certification',
    requirement: 'ISO 9001:2015 or verified automotive bodybuilding component supplier certification',
    weightPercent: 15,
    checked: true,
    notes: 'Audited during Masvingo vendor review: certified composite contractor.',
  },
  {
    id: 'SQ-02',
    category: 'Material Batch Control',
    requirement: 'Full batch traceability certificates (COA) for all vinyl-ester/polyester resin and gelcoats',
    weightPercent: 15,
    checked: true,
    notes: 'Lot numbers supplied on each 200L drum delivery with manufacturer expiry dates.',
  },
  {
    id: 'SQ-03',
    category: 'Facility Environment',
    requirement: 'Dedicated dust-free lamination bay with temperature (18–28°C) and RH (<70%) control',
    weightPercent: 10,
    checked: true,
    notes: 'Exhaust extraction fans and digital thermohygrometer installed.',
  },
  {
    id: 'SQ-04',
    category: 'Testing Equipment',
    requirement: 'Calibrated Barcol Impressor (Model 934-1), ultrasonic thickness gauge, and gloss meter',
    weightPercent: 15,
    checked: true,
    notes: 'Barcol hardness verification calibrated to ASTM D2583 standards.',
  },
  {
    id: 'SQ-05',
    category: 'First-Article Fixture',
    requirement: 'Dedicated go/no-go perimeter check fixture matching AVM chassis datum locator pins (±0.5mm)',
    weightPercent: 15,
    checked: true,
    notes: 'Universal recess master check fixture supplied by AVM Tooling Room.',
  },
  {
    id: 'SQ-06',
    category: 'Workforce Competency',
    requirement: 'At least two journeyman certified FRP laminators on shift for contingency redundancy',
    weightPercent: 10,
    checked: true,
    notes: 'Both operators evaluated and cross-trained on AVM modular bezel insert SOP.',
  },
  {
    id: 'SQ-07',
    category: 'Waterproofing Rig',
    requirement: 'High-pressure continuous spray water test rig capable of 2.0 bar at 15-minute duration',
    weightPercent: 10,
    checked: true,
    notes: 'Zero water ingress verified across EPDM bezel perimeter seal.',
  },
  {
    id: 'SQ-08',
    category: 'Emergency Lead-Time SLA',
    requirement: 'Contractual guarantee to deliver emergency replacement inserts within 48 hours notice',
    weightPercent: 10,
    checked: true,
    notes: '48-hour turn-around SLA incorporated into vendor contract.',
  },
];

export interface FirstArticleInspectionItem {
  id: string;
  testName: string;
  methodology: string;
  nominalSpec: string;
  tolerance: string;
  measuredSample: string;
  result: 'PASS' | 'FAIL' | 'CONDITIONAL';
}

export const FIRST_ARTICLE_INSPECTION_RECORD: FirstArticleInspectionItem[] = [
  {
    id: 'FAI-01',
    testName: 'Laminate Wall Thickness',
    methodology: 'Ultrasonic D-Meter Gauge (5-point average on bezel perimeter)',
    nominalSpec: '3.50 mm',
    tolerance: '± 0.30 mm (3.20 - 3.80 mm)',
    measuredSample: '3.48 mm (Port: 3.45, Center: 3.52, Starboard: 3.47)',
    result: 'PASS',
  },
  {
    id: 'FAI-02',
    testName: 'Barcol Hardness (Cure Level)',
    methodology: 'ASTM D2583 Barcol Impressor (Model 934-1)',
    nominalSpec: '≥ 40 Barcol',
    tolerance: 'Min 38 Barcol after 24h cure',
    measuredSample: '42.5 Barcol (100% cure achieved)',
    result: 'PASS',
  },
  {
    id: 'FAI-03',
    testName: 'Check Fixture Fit Gauge & Flushness',
    methodology: 'Feeler gauge against AVM Master Rear Cap Fixture',
    nominalSpec: 'Flush reveal gap: 1.50 mm',
    tolerance: '± 0.50 mm gap / ± 0.30 mm flushness step',
    measuredSample: 'Gap: 1.42 mm · Flushness: 0.18 mm step (Exceeds spec)',
    result: 'PASS',
  },
  {
    id: 'FAI-04',
    testName: 'Pressurized Water-Leak Spray Test',
    methodology: '2.0 Bar continuous spray nozzle at 300mm for 15 minutes',
    nominalSpec: 'Zero water ingress (IP67 compliance)',
    tolerance: '0 ml moisture inside electrical cavity',
    measuredSample: '0.00 ml (EPDM closed-cell compression seal bone dry)',
    result: 'PASS',
  },
];

// ==========================================
// SECTION 5 & 6: SITE VISIT NOTES & LIMITS SLIDE (FINALS JUDGES AUDIT)
// ==========================================
export interface SiteVisitValidationItem {
  item: string;
  briefPlanningAssumption: string;
  siteVisitInvestigationPlan: string;
  currentValidationStatus: 'VALIDATED_ON_SITE' | 'PENDING_MASVINGO_CHECK' | 'CRITICAL_JUDGES_NOTE';
  impactOnSolution: string;
}

export const SITE_VISIT_VALIDATION_ITEMS: SiteVisitValidationItem[] = [
  {
    item: 'Actual Freeze Point in AVM Workflow',
    briefPlanningAssumption: 'Gates G1 (Frames), G2 (Fibre), G3 (Trim), G4 (Paint)',
    siteVisitInvestigationPlan: 'Audit production whiteboard and interviewing Works Manager to confirm if structural frames lock at Stage 2 or Stage 3.',
    currentValidationStatus: 'VALIDATED_ON_SITE',
    impactOnSolution: 'Confirmed: AVM starts sheet metal skinning at Stage 4; locking G2 before Fibre shop prevents 92% of rework.',
  },
  {
    item: 'Taillight Change Hours & Costs',
    briefPlanningAssumption: '6 days lost, $1,800 outsourcing, $3,600 holding, $2,200 discount',
    siteVisitInvestigationPlan: 'Review procurement invoices from July 2026 external moulder and supervisor timecards.',
    currentValidationStatus: 'VALIDATED_ON_SITE',
    impactOnSolution: 'Actual figures from AVM visit show $7,600 total financial bleeding on the single Falcon bus order.',
  },
  {
    item: 'Current Scope-of-Work Document Format',
    briefPlanningAssumption: 'Paper clipboards and static Excel Gantt charts',
    siteVisitInvestigationPlan: 'Inspect physical job traveler printed on A4 paper clamped to front bumper of chassis.',
    currentValidationStatus: 'VALIDATED_ON_SITE',
    impactOnSolution: 'Paper traveler was frequently greased and not updated; digital QR tag directly replaces this vulnerability.',
  },
  {
    item: 'Buffer Sizes and Station Takt Times',
    briefPlanningAssumption: '1.5 days buffer between Fibre and Coach Building; 1 day before Finishing',
    siteVisitInvestigationPlan: 'Measure floor space footprint between bays for physical buffer carts and takt time per station (average 18.5h per station).',
    currentValidationStatus: 'VALIDATED_ON_SITE',
    impactOnSolution: 'Buffer sizes set to 1 complete sub-assembly ahead, enabling seamless unblocked unit pull forward.',
  },
  {
    item: 'Supplier Quote for Bezel Insert',
    briefPlanningAssumption: 'Assumption of $50 to $100 per insert',
    siteVisitInvestigationPlan: 'Obtain written quotes from local Harare CNC/vacuum forming supplier vs in-house 3D printing/plug.',
    currentValidationStatus: 'CRITICAL_JUDGES_NOTE',
    impactOnSolution: 'In-house composite plug: $48 material + $22 labour = $70 total. External CNC quote: $85. Assumption fully validated!',
  },
];

