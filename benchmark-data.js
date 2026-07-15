/**
 * FRAMELIMIT benchmark display standard.
 * Legacy charts are annotated at runtime; no missing result is invented.
 */
(function () {
  'use strict';

  const standard = {
    version: '2026.07',
    requiredGameFields: [
      'source', 'sourceUrl', 'laptopId', 'cpu', 'gpu', 'gpuPower',
      'resolution', 'preset', 'rayTracing', 'upscaler', 'qualityMode',
      'frameGeneration', 'averageFps', 'low1Fps', 'driver', 'testedAt'
    ],
    resultTypes: {
      native: 'Rendered at native resolution without upscaling or frame generation.',
      upscaled: 'Rendered below output resolution and reconstructed by DLSS, FSR, or XeSS.',
      generated: 'Displayed FPS includes generated frames and is not directly comparable with rendered FPS.'
    },
    synthetic: [
      { name: '3DMark Steel Nomad', role: 'Modern high-end raster graphics comparison' },
      { name: '3DMark Speed Way / Port Royal', role: 'Ray-tracing graphics comparison' },
      { name: '3DMark Time Spy Graphics', role: 'Legacy cross-source DX12 comparison' },
      { name: 'Cinebench 2024', role: 'CPU single-core and multi-core comparison' }
    ]
  };

  const technologies = [
    {
      family: 'RTX 50',
      upscaling: 'DLSS Super Resolution',
      frameGeneration: 'DLSS Multi Frame Generation',
      latency: 'NVIDIA Reflex',
      note: 'State SR mode and MFG multiplier separately.'
    },
    {
      family: 'RTX 40',
      upscaling: 'DLSS Super Resolution',
      frameGeneration: 'DLSS Frame Generation (single generated frame)',
      latency: 'NVIDIA Reflex',
      note: 'Supports DLSS 4 model upgrades, but not Multi Frame Generation.'
    },
    {
      family: 'Radeon RX 9000',
      upscaling: 'FSR Upscaling / Redstone',
      frameGeneration: 'FSR Frame Generation',
      latency: 'Radeon Anti-Lag 2 where supported',
      note: 'Record native game integration or AMD Software override.'
    },
    {
      family: 'Radeon RX 7000 mobile',
      upscaling: 'FSR Upscaling (game and driver dependent)',
      frameGeneration: 'FSR 3 FG or AFMF where supported',
      latency: 'Radeon Anti-Lag',
      note: 'Do not label the full Redstone suite as universally supported.'
    }
  ];

  const flagshipSources = {
    scar: 'https://www.notebookcheck.net/The-18-inch-gamer-with-great-mini-LED-and-an-RTX-5090-Laptop-Asus-Strix-SCAR-18-G835LX-review.990635.0.html',
    legion: 'https://www.notebookcheck.net/Lenovo-Legion-Pro-7i-16-Gen-10-laptop-review-400-W-power-supply-with-almost-no-compromises.999828.0.html',
    razer: 'https://www.notebookcheck.net/Razer-Blade-16-2025-review-Gaming-laptop-now-with-GeForce-RTX-5090-Laptop-and-an-even-slimmer-case.988251.0.html',
    legionFg: 'https://www.ultrabookreview.com/71446-lenovo-legion-pro-7i-gen10-review/',
    dlss: 'https://www.nvidia.com/en-us/geforce/news/nvidia-app-update-g-assist-new-dlss-override-and-more/'
  };

  const modelBenchmarks = {
    'verified-scar16-benchmark': {
      title: 'ASUS ROG Strix SCAR 16 (2025)',
      configuration: 'G635LW · Core Ultra 9 275HX · RTX 5080 Laptop · 175W max TGP · 32GB DDR5-5600',
      games: [
        ['Cyberpunk 2077', '2560×1600 · Ultra · RT off', 'Native · FG off', '150–165W observed', 82, 50, null],
        ['Cyberpunk 2077', '2560×1600 · RT Overdrive', 'DLSS Balanced · MFG x2', '150–165W observed', 102, 44, null],
        ['Cyberpunk 2077', '2560×1600 · RT Overdrive', 'DLSS Balanced · MFG x4', '150–165W observed', 176, 36, null],
        ['Black Myth: Wukong', '2560×1600 · Cinematic · RT Very High', 'DLSS Balanced · MFG x2', '150–165W observed', 86, 62, null],
        ['Black Myth: Wukong', '2560×1600 · Cinematic · RT Very High', 'DLSS Balanced · MFG x4', '150–165W observed', 156, 32, null],
        ['Far Cry 6', '2560×1600 · Ultra · TAA', 'Native · FG off', '150–165W observed', 130, 100, null],
        ['Shadow of the Tomb Raider', '2560×1600 · Highest · TAA', 'Native · FG off', '150–165W observed', 158, 114, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Graphics', 21456], ['3DMark Time Spy', 'Overall', 20528],
        ['3DMark Port Royal', 'Overall', 13783], ['3DMark Speed Way', 'Overall', 5665],
        ['3DMark Steel Nomad', 'Overall', 5211]
      ],
      sources: [['Ultrabookreview exact-configuration review', 'https://www.ultrabookreview.com/71050-asus-rog-scar-16-g635-review/']]
    },
    'verified-g16-benchmark': {
      title: 'ASUS ROG Zephyrus G16 (2026)',
      configuration: 'GU606 · Core Ultra 9 386H · RTX 5080 Laptop · 160W max TGP · 64GB LPDDR5X',
      games: [
        ['Black Myth: Wukong', 'QHD · Cinematic', 'Native · DLSS/FG off', '160W max TGP', 33, null, null],
        ['Doom: The Dark Ages', 'QHD · Ultra RT', 'Native · DLSS/FG off', '160W max TGP', 53, null, null],
        ['F1 23', 'QHD · Ultra', 'Native · DLSS/FG off', '160W max TGP', 52, null, null],
        ['Cyberpunk 2077', 'QHD · RT Ultra', 'Native · DLSS/FG off', '160W max TGP', 30, null, null],
        ['Shadow of the Tomb Raider', 'QHD · Max', 'Native · DLSS/FG off', '160W max TGP', 95, null, null]
      ],
      synthetics: [
        ['Geekbench 6', 'Single-core', 2877], ['Geekbench 6', 'Multi-core', 16960]
      ],
      sources: [
        ['Tom\'s Guide exact-configuration review', 'https://www.tomsguide.com/computing/gaming-laptops/asus-rog-zephyrus-g16-2026-review'],
        ['ASUS GU606 specifications', 'https://rog.asus.com/in/laptops/rog-zephyrus/rog-zephyrus-g16-2026/']
      ]
    },
    'verified-legion-benchmark': {
      title: 'Lenovo Legion Pro 7i Gen 10',
      configuration: '16IAX10H · Core Ultra 9 275HX · RTX 5080 Laptop · 175W max TGP',
      games: [
        ['Cyberpunk 2077', '2560×1440 · Ultra', 'Native · FG off', '175W max TGP', 99.8, 81.6, 85.5],
        ['Cyberpunk 2077', '2560×1440 · Ultra', 'DLSS Quality · FG off', '175W max TGP', 119, 98.2, 102.5],
        ['Cyberpunk 2077', 'QHD+ · RT Overdrive', 'Native · FG off', '175W max TGP', 28, 14, null],
        ['Cyberpunk 2077', 'QHD+ · RT Overdrive', 'DLSS Balanced · MFG x2', '175W max TGP', 108, 42, null],
        ['Cyberpunk 2077', 'QHD+ · RT Overdrive', 'DLSS Balanced · MFG x4', '175W max TGP', 164, 34, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Graphics', 23003], ['3DMark Time Spy', 'Overall', 21992],
        ['3DMark Speed Way', 'Overall', 5918]
      ],
      sources: [
        ['Notebookcheck exact-configuration review', flagshipSources.legion],
        ['Ultrabookreview Frame Generation tests', flagshipSources.legionFg]
      ]
    },
    'verified-legion7i-benchmark': {
      title: 'Lenovo Legion 7i Gen 10 (2025)',
      configuration: '16IAX10 · Core Ultra 9 275HX · RTX 5070 Laptop · 115W max TGP · 32GB DDR5-6400 · 165Hz OLED',
      games: [
        ['Cyberpunk 2077', '2560×1600 · Ultra · RT off', 'Native · FG off', '105W observed', 56, 45, null],
        ['Cyberpunk 2077', '2560×1600 · RT Overdrive', 'DLSS Balanced · MFG x2', '105W observed', 72, 31, null],
        ['Cyberpunk 2077', '2560×1600 · RT Overdrive', 'DLSS Balanced · MFG x4', '105W observed', 124, 28, null],
        ['Black Myth: Wukong', '2560×1600 · Cinematic · RT off', 'TSR 55 · FG off', '105W observed', 42, 29, null],
        ['Black Myth: Wukong', '2560×1600 · Cinematic · RT Very High', 'DLSS Balanced · MFG x2', '105W observed', 58, 16, null],
        ['Black Myth: Wukong', '2560×1600 · Cinematic · RT Very High', 'DLSS Balanced · MFG x4', '105W observed', 76, 16, null],
        ['Far Cry 6', '2560×1600 · Ultra · TAA', 'Native · FG off', '105W observed', 96, 78, null],
        ['Horizon Forbidden West', '2560×1600 · Very High · TAA', 'Native · FG off', '105W observed', 54, 40, null],
        ['Shadow of the Tomb Raider', '2560×1600 · Highest · TAA', 'Native · FG off', '105W observed', 113, 86, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Graphics', 13804], ['3DMark Time Spy', 'Overall', 14161],
        ['3DMark Port Royal', 'Overall', 8855], ['3DMark Speed Way', 'Overall', 3461],
        ['3DMark Steel Nomad', 'Overall', 3168]
      ],
      sources: [['Ultrabookreview exact-configuration review', 'https://www.ultrabookreview.com/73885-lenovo-legion-7i-review-2/']]
    },
    'verified-raider18-benchmark': {
      title: 'MSI Raider 18 HX AI (2025)',
      configuration: 'A2XW · Core Ultra 9 285HX · RTX 5080 Laptop · 175W max TGP',
      games: [
        ['Shadow of the Tomb Raider', '1920×1080 · Highest · RT off', 'Native · DLSS/FG off', '175W max TGP', 194, null, null],
        ['Shadow of the Tomb Raider', '3840×2160 · Highest · RT off', 'Native · DLSS/FG off', '175W max TGP', 100, null, null],
        ['Metro Exodus', '1920×1080 · Extreme', 'Native · DLSS/FG off', '175W max TGP', 94, null, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Overall', 21152], ['3DMark Port Royal', 'Overall', 14044]
      ],
      sources: [
        ['PCWorld exact-configuration review', 'https://www.pcworld.com/article/2683984/msi-raider-18-hx-ai-review.html'],
        ['PC Gamer configuration verification', 'https://www.pcgamer.com/hardware/gaming-laptops/msi-raider-18-hx-ai-a2xw-gaming-laptop-review/']
      ]
    },
    'verified-stealtha16-benchmark': {
      title: 'MSI Stealth A16 AI+ (2025)',
      configuration: 'Ryzen AI 9 HX 370 · RTX 5070 Ti Laptop · 64GB LPDDR5X · 2560×1600 OLED 240Hz',
      games: [
        ['Total War: Warhammer III', '1920×1080 · Ultra', 'Upscaling / FG not stated', 'Not stated by source', 176, null, null],
        ['Cyberpunk 2077', '1920×1080 · Ultra', 'Upscaling / FG not stated', 'Not stated by source', 105, null, null],
        ['Dirt 5', '1920×1080 · Ultra', 'Upscaling / FG not stated', 'Not stated by source', 206, null, null]
      ],
      synthetics: [
        ['3DMark Night Raid', 'Overall', 38762], ['3DMark Fire Strike', 'Overall', 30723],
        ['3DMark Time Spy', 'Overall', 13384]
      ],
      sources: [['TechRadar exact-configuration review', 'https://www.techradar.com/computing/gaming-laptops/msi-stealth-a16-ai-review-thin-light-and-hot']]
    },
    'verified-blade14-benchmark': {
      title: 'Razer Blade 14 (2025)',
      configuration: 'Ryzen AI 9 365 · RTX 5070 Laptop · 115W max TGP · 32GB LPDDR5X · 2880×1800 OLED 120Hz',
      games: [
        ['Cyberpunk 2077', '2880×1800 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 45, null, null],
        ['Cyberpunk 2077', '2560×1600 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 59, null, null],
        ['Cyberpunk 2077', '1920×1200 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 95, null, null],
        ['Black Myth: Wukong', '2880×1800 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 24, null, null],
        ['Black Myth: Wukong', '2560×1600 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 28, null, null],
        ['Black Myth: Wukong', '1920×1200 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 37, null, null],
        ['Marvel Rivals', '2560×1600 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 38, null, null],
        ['Monster Hunter Wilds', '2560×1600 · Max preset', 'Native · RT/upscaling/FG off', '115W max TGP', 45, null, null]
      ],
      synthetics: [],
      sources: [
        ['WIRED exact-configuration review', 'https://www.wired.com/review/razer-blade-14-2025/'],
        ['Razer specification confirmation', 'https://www.theverge.com/news/669500/razer-blade-14-gaming-laptop-rtx-5060-5070-specs-price']
      ]
    },
    'verified-blade16-benchmark': {
      title: 'Razer Blade 16 (2026)',
      configuration: 'RZ09-0581 · Core Ultra 9 386H · RTX 5090 Laptop · up to 165W · 32GB test configuration · 2560×1600 OLED 240Hz',
      games: [
        ['Black Myth: Wukong', 'QHD · Cinematic', 'Native · DLSS/FG off', '165W max TGP', 44, null, null],
        ['Doom: The Dark Ages', 'QHD · Ultra RT', 'Native · DLSS/FG off', '165W max TGP', 66, null, null],
        ['F1 23', 'QHD · Ultra', 'Native · DLSS/FG off', '165W max TGP', 72, null, null],
        ['Cyberpunk 2077', 'QHD · RT Ultra', 'Native · DLSS/FG off', '165W max TGP', 42, null, null],
        ['Shadow of the Tomb Raider', 'QHD · Max', 'Native · DLSS/FG off', '165W max TGP', 133, null, null],
        ['Assassin\'s Creed Shadows', '2560×1600 · Max', 'Native · DLSS/FG off', '165W max TGP', 45, null, null],
        ['Cyberpunk 2077', '2560×1600 · Max', 'Native · DLSS/FG off', '165W max TGP', 41, null, null],
        ['Red Dead Redemption 2', '2560×1600 · Max', 'Native · DLSS/FG off', '165W max TGP', 50, null, null]
      ],
      synthetics: [
        ['Geekbench 6', 'Single-core', 2895], ['Geekbench 6', 'Multi-core', 16971]
      ],
      sources: [
        ['Tom\'s Guide exact-configuration review', 'https://www.tomsguide.com/computing/gaming-laptops/razer-blade-16-2026-review'],
        ['Razer RZ09-0581 specifications', 'https://www.razer.com/gaming-laptops/razer-blade-16/RZ09-05819EN9-R3U1']
      ]
    },
    'verified-vector16-benchmark': {
      title: 'MSI Vector 16 HX AI (2025)',
      configuration: 'A2XWIG · Core Ultra 9 275HX · RTX 5080 Laptop · 175W max TGP · 32GB DDR5-5600 · 2560×1600 IPS 240Hz',
      games: [
        ['Black Myth: Wukong', '2560×1600 · Path Tracing on', 'DLSS 4 Balanced · MFG x4', '175W max TGP', 88, null, null],
        ['Black Myth: Wukong', '2560×1600 · Path Tracing on', 'DLSS 4 Balanced · FG off', '175W max TGP', 52, null, null],
        ['Black Myth: Wukong', '2560×1600 · Path Tracing on', 'Native · DLSS/FG off', '175W max TGP', 25, null, null],
        ['Black Myth: Wukong', '2560×1600 · RT off', 'DLSS 4 Balanced · MFG x4', '175W max TGP', 103, null, null],
        ['Black Myth: Wukong', '2560×1600 · RT off', 'DLSS 4 Balanced · FG off', '175W max TGP', 63, null, null],
        ['Black Myth: Wukong', '2560×1600 · RT off', 'Native · DLSS/FG off', '175W max TGP', 44, null, null],
        ['Cyberpunk 2077', '2560×1600 · Path Tracing on', 'DLSS 4 Balanced · MFG x4', '175W max TGP', 164, null, null],
        ['Cyberpunk 2077', '2560×1600 · Path Tracing on', 'DLSS 4 Balanced · FG off', '175W max TGP', 52.1, null, null],
        ['Cyberpunk 2077', '2560×1600 · Path Tracing on', 'Native · DLSS/FG off', '175W max TGP', 22, null, null],
        ['Cyberpunk 2077', '2560×1600 · RT off', 'DLSS 4 Balanced · MFG x4', '175W max TGP', 289.53, null, null],
        ['Cyberpunk 2077', '2560×1600 · RT off', 'DLSS 4 Balanced · FG off', '175W max TGP', 120.87, null, null],
        ['Cyberpunk 2077', '2560×1600 · RT off', 'Native · DLSS/FG off', '175W max TGP', 86.07, null, null]
      ],
      synthetics: [
        ['3DMark Speed Way', 'Overall', 5729], ['3DMark Steel Nomad', 'Overall', 5027],
        ['Cinebench 2024', 'Single-core', 131], ['Cinebench 2024', 'Multi-core', 1999]
      ],
      sources: [
        ['Frandroid exact-configuration measurements', 'https://www.frandroid.com/marques/2585419_test-du-msi-vector-16-hx-ai-a2xw-la-puissance-a-tout-prix'],
        ['PC Gamer A2XWIG configuration verification', 'https://www.pcgamer.com/hardware/gaming-laptops/msi-vector-16-hx-ai-gaming-laptop-review/']
      ]
    },
    'verified-heliosneo-benchmark': {
      title: 'Acer Predator Helios Neo 16S AI (2025)',
      configuration: 'PHN16S-71-98RF · Core Ultra 9 275HX · RTX 5070 Ti Laptop · 115W max TGP · 32GB DDR5-6400 · 2560×1600 OLED 240Hz',
      games: [
        ['Shadow of the Tomb Raider', 'Source standard benchmark · resolution not stated', 'Native · upscaling/FG not stated', '115W max TGP', 160, null, null],
        ['Metro Exodus', 'Extreme · resolution not stated', 'Native · upscaling/FG not stated', '115W max TGP', 56, null, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Overall', 13528], ['PCMark 10', 'Overall', 8320]
      ],
      sources: [
        ['PCWorld PHN16S-71-98RF review', 'https://www.pcworld.com/article/2886413/acer-predator-helios-neo-16s-ai-review.html'],
        ['Acer Helios Neo 16S AI specifications', 'https://www.acerid.com/content/uploads/2025/01/%5BSiaran%20Pers%5D%20Acer%20Mengumumkan%20Hadirnya%20Laptop%20Gaming%20Predator%20Helios%20AI%2C%20Ditenagai%20Prosesor%20Intel%20Core%20Ultra%20Terbaru%20dan%20GPU%20NVIDIA%20GeForce%20RTX%2050%20Series.pdf']
      ]
    },
    'verified-aurora16x-benchmark': {
      title: 'Alienware 16X Aurora (2025)',
      configuration: 'AC16251 · Core Ultra 9 275HX · RTX 5070 Laptop · 115W max TGP · 32GB DDR5 · 1TB SSD · 2560×1600 IPS 240Hz',
      games: [
        ['Senua\'s Saga: Hellblade II', '2560×1600 · Max', 'Native · upscaling/FG off', '115W max TGP', 30, null, null],
        ['Senua\'s Saga: Hellblade II', '2560×1600 · Max', 'DLSS on · mode/FG not stated', '115W max TGP', 50, null, null],
        ['Doom: The Dark Ages', '2560×1600 · preset not stated', 'Native · upscaling/FG off', '115W max TGP', 46, null, null],
        ['Marvel Rivals', '2560×1600 · Ultra', 'Native · upscaling/FG off', '115W max TGP', 44.7, null, null],
        ['Cyberpunk 2077', '1920×1080 · Medium', 'Native · upscaling/FG off', '115W max TGP', 43, null, null],
        ['Assassin\'s Creed Shadows', '1920×1080 · Medium', 'Native · upscaling/FG off', '115W max TGP', 63, null, null],
        ['Assassin\'s Creed Shadows', '1920×1080 · Ultra High', 'Native · upscaling/FG off', '115W max TGP', 36, null, null],
        ['Black Myth: Wukong', '1920×1080 · Medium', 'Native · upscaling/FG off', '115W max TGP', 111, null, null],
        ['Black Myth: Wukong', '1920×1080 · Cinematic', 'Native · upscaling/FG off', '115W max TGP', 45, null, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Overall', 13594], ['3DMark Fire Strike', 'Overall', 31480],
        ['3DMark Steel Nomad', 'Overall', 2987], ['Geekbench 6', 'Single-core', 3028],
        ['Geekbench 6', 'Multi-core', 19715]
      ],
      sources: [
        ['TechRadar exact-configuration review', 'https://www.techradar.com/computing/gaming-laptops/alienware-16x-aurora'],
        ['Notebookcheck AC16251 power verification', 'https://www.notebookcheck.net/Alienware-16X-Aurora-review-Balancing-premium-build-with-a-midrange-GPU.1082442.0.html']
      ]
    },
    'verified-tufa16-benchmark': {
      title: 'ASUS TUF Gaming A16 (FA608, 2025)',
      configuration: 'FA608 · Ryzen 7 260 · RTX 5060 Laptop · 115W max TGP · 32GB DDR5 · 1920x1200 IPS 165Hz',
      games: [
        ['Counter-Strike 2', '1920x1200 · Very High', 'Native · upscaling/FG not stated', '115W max TGP', 196, null, null],
        ['Black Myth: Wukong', '1920x1200 · High', 'Native · upscaling/FG not stated', '115W max TGP', 92, null, null],
        ['Black Myth: Wukong', '1920x1200 · Cinematic', 'Native · upscaling/FG not stated', '115W max TGP', 35, null, null],
        ['Shadow of the Tomb Raider', '1920x1200 · Highest', 'Native · upscaling/FG not stated', '115W max TGP', 112, null, null],
        ['Metro Exodus Enhanced Edition', '1920x1200 · High', 'Native · upscaling/FG not stated', '115W max TGP', 99, null, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Graphics', 12546], ['3DMark Wild Life Extreme', 'Graphics', 23039]
      ],
      sources: [['LaptopMedia FA608 exact-configuration review', 'https://laptopmedia.com/ca/review/asus-tuf-gaming-a16-fa608-2025-review-a-14-hour-battery-on-a-gaming-laptop/']]
    },
    'verified-legion5i-benchmark': {
      title: 'Lenovo Legion 5i Gen 10',
      configuration: '15IRX10 · Core i7-13650HX · RTX 5070 Laptop · 115W max TGP · 16GB DDR5 · 1920x1200 IPS 165Hz',
      games: [],
      synthetics: [
        ['3DMark Time Spy', 'Graphics', 14287], ['3DMark Wild Life Extreme', 'Graphics', 25819],
        ['Cinebench 2024', 'Multi-core', 903]
      ],
      sources: [
        ['LaptopMedia 15IRX10 measured review', 'https://laptopmedia.com/review/lenovo-legion-5i-15-15irhx10-gen-10-review-the-fastest-rtx-5070-weve-ever-tested/'],
        ['Lenovo 15IRX10 specifications', 'https://psrefstuff.lenovo.com/syspool/Sys/PDF/datasheet/Legion_5_15IRX10_Datasheet_EN.pdf']
      ]
    },
    'verified-legion5amd-benchmark': {
      title: 'Lenovo Legion 5 Gen 10 AMD',
      configuration: '15AHP10 · Ryzen AI 7 350 · RTX 5070 Laptop · 115W max TGP · 32GB DDR5 · 2560x1600 OLED 165Hz',
      games: [],
      synthetics: [
        ['3DMark Time Spy', 'Graphics', 14304], ['3DMark Wild Life Extreme', 'Graphics', 25835]
      ],
      sources: [
        ['LaptopMedia Legion 5 Gen 10 configuration results', 'https://laptopmedia.com/review/lenovo-legion-5-15-gen-10-review/'],
        ['Lenovo 15AHP10 specifications', 'https://psrefstuff.lenovo.com/syspool/Sys/PDF/datasheet/Legion_5_15AHP10_Datasheet_EN.pdf']
      ]
    },
    'verified-katana15-benchmark': {
      title: 'MSI Katana 15 HX B14WGK',
      configuration: 'B14WGK · Core i9-14900HX · RTX 5070 Laptop · 115W max TGP · 32GB DDR5 · 2560x1440 IPS 165Hz',
      games: [
        ['Cyberpunk 2077', '2560x1440 · Ultra', 'DLSS Balanced · FG off', '115W max TGP', 90, null, null],
        ['Cyberpunk 2077', '2560x1440 · RT Ultra', 'DLSS Balanced · FG off', '115W max TGP', 54, null, null],
        ['Cyberpunk 2077', '2560x1440 · RT Ultra', 'DLSS Balanced · FG x2', '115W max TGP', 115, null, null],
        ['Shadow of the Tomb Raider', '2560x1440 · Ultra', 'DLSS Balanced · FG unavailable', '115W max TGP', 160, null, null],
        ['Monster Hunter Wilds', '2560x1440 · Ultra', 'DLSS Balanced · FG off', '115W max TGP', 55, null, null],
        ['Monster Hunter Wilds', '1920x1080 · Ultra', 'DLSS Balanced · FG off', '115W max TGP', 66.51, null, null]
      ],
      synthetics: [],
      sources: [
        ['TechRadar B14W measured gaming tests', 'https://www.techradar.com/computing/gaming-laptops/8gb-of-vram-could-be-all-you-can-find-in-laptop-gpus-soon-but-is-it-enough-i-tested-the-msi-katana-15-hx-to-find-out'],
        ['MSI B14WGK exact SKU specification', 'https://storage-asset.msi.com/specSheet/au/nb/Katana%2015%20HX%20B14WGK-298NZ.pdf']
      ]
    },
    'verified-area51-benchmark': {
      title: 'Alienware 18 Area-51 (2025)',
      configuration: 'AA18250 · Core Ultra 9 275HX · RTX 5090 Laptop · 175W max TGP · 64GB DDR5-6400 · 2560x1600 IPS 300Hz',
      games: [
        ['Cyberpunk 2077', 'Resolution not stated · RT Ultra', 'Native · upscaling/FG off', '175W max TGP', 50, null, null],
        ['Cyberpunk 2077', 'Resolution not stated · RT Ultra', 'DLSS Quality · FG off', '175W max TGP', 84, null, null],
        ['Cyberpunk 2077', 'Resolution not stated · RT Ultra', 'DLSS Balanced · MFG multiplier not stated', '175W max TGP', 212, null, null],
        ['Red Dead Redemption 2', 'Resolution not stated · Ultra', 'Native · upscaling/FG off', '175W max TGP', 80, null, null],
        ['Red Dead Redemption 2', 'Resolution not stated · Ultra', 'DLSS Quality · FG off', '175W max TGP', 106, null, null],
        ['Black Myth: Wukong', 'Resolution not stated · High', 'Native · upscaling/FG off', '175W max TGP', 80, null, null],
        ['Black Myth: Wukong', 'Resolution not stated · High', 'DLSS Quality · FG off', '175W max TGP', 118, null, 98],
        ['Indiana Jones and the Great Circle', 'Resolution not stated · Ultra', 'Native · upscaling/FG off', '175W max TGP', 110, null, null]
      ],
      synthetics: [],
      sources: [
        ['Beebom exact-configuration measurements', 'https://beebom.com/alienware-18-area-51-review/'],
        ['PC Gamer AA18250 configuration verification', 'https://www.pcgamer.com/hardware/gaming-laptops/alienware-18-area-51-2025-review/']
      ]
    },
    'verified-omenmax-benchmark': {
      title: 'HP Omen Max 16 (2025)',
      configuration: '16-ah0070ca · Core Ultra 9 275HX · RTX 5080 Laptop · 175W max TGP · 32GB DDR5 · 2560x1600 IPS 240Hz',
      games: [
        ['Shadow of the Tomb Raider', '1920x1080 · Highest', 'Native · DLSS off · FG off', '175W max TGP', 165, null, null],
        ['Metro Exodus', '1920x1080 · Extreme', 'Native · upscaling/FG off', '175W max TGP', 89, null, null],
        ['Cyberpunk 2077', '1920x1080 · Ultra · RT off', 'Native · upscaling/FG off', '175W max TGP', 143, null, null],
        ['Cyberpunk 2077', '1920x1080 · RT Overdrive', 'Native · upscaling/FG off', '175W max TGP', 40, null, null]
      ],
      synthetics: [['Cinebench R23', 'Multi-core', 33224]],
      sources: [
        ['PCWorld exact-configuration review', 'https://www.pcworld.com/article/2785374/hp-omen-max-16-review-packs-rtx-5080-performance-for-a-little-less.html'],
        ['RTINGS 16-ah0070ca configuration verification', 'https://www.rtings.com/laptop/reviews/hp/omen-max-16-2025']
      ]
    },
    'verified-omentranscend-benchmark': {
      title: 'HP Omen Transcend 14 (2025)',
      configuration: '14-fb1053dx · Core Ultra 9 285H · RTX 5070 Laptop · 8GB GDDR7 · 32GB LPDDR5X · 2880x1800 OLED 120Hz',
      games: [
        ['FBC: Firebreak', 'Resolution / preset not stated', 'DLSS 4 state not stated', 'TGP not published by source', 70, null, null]
      ],
      synthetics: [],
      sources: [
        ['Tom\'s Guide hands-on measurement', 'https://www.tomsguide.com/computing/gaming-laptops/i-just-played-marvel-rivals-on-an-rtx-5070-ti-gaming-laptop-and-it-reached-a-shockingly-high-320-fps'],
        ['HP 14-fb1053dx product specification', 'https://files.bbystatic.com/8OqUBapzCzktVOXeCrjY4g%3D%3D/fd8bf1da-8cc4-49d2-b7e5-ab75963dc412.pdf']
      ]
    },
    'verified-dellg16-benchmark': {
      title: 'Dell G16 7630',
      configuration: 'G16 7630 · Core i9-13900HX · RTX 4070 Laptop · 140W max TGP · 32GB DDR5 · 2560x1600 IPS 240Hz',
      games: [
        ['League of Legends', '2560x1600 · preset not stated', 'Native · upscaling/FG off', '140W max TGP', 236, null, null],
        ['The Witcher 3', 'Resolution not stated · ray tracing on', 'Native · DLSS/FG off', '140W max TGP', 64, null, null],
        ['The Witcher 3', 'Resolution not stated · ray tracing on', 'DLSS 3 · FG state not separated', '140W max TGP', 95, null, null]
      ],
      synthetics: [
        ['3DMark Time Spy', 'Graphics', 12157], ['3DMark Time Spy', 'Overall', 12231],
        ['3DMark Fire Strike', 'Graphics', 30007], ['3DMark Fire Strike', 'Overall', 25191],
        ['Cinebench', 'Multi-core', 10658]
      ],
      sources: [
        ['MyFixGuide i9/RTX 4070 measurements', 'https://www.myfixguide.com/dell-g16-7630-review/'],
        ['PCWorld exact-configuration verification', 'https://www.pcworld.com/article/2326937/dell-g16-7630-review.html']
      ]
    },
    'verified-gigabytea16-benchmark': {
      title: 'Gigabyte Gaming A16 (2025)',
      configuration: 'Gaming A16 · Core i7-13620H · RTX 5060 Laptop · 85W max TGP · 32GB DDR5 · 1920x1200 IPS 165Hz',
      games: [
        ['Cyberpunk 2077', '1920x1200 · Ultra · Path Tracing', 'DLSS · MFG x4', '85W max TGP', 102, null, null],
        ['Cyberpunk 2077', '1920x1200 · Ultra · RT Ultra', 'DLSS Quality · FG off', '85W max TGP', 47, null, null],
        ['Cyberpunk 2077', '1920x1200 · Ultra · RT off', 'Native · FG off', '85W max TGP', 78, null, null],
        ['Black Myth: Wukong', '1920x1200 · Cinematic · max Path Tracing', 'DLSS High · MFG x4', '85W max TGP', 97, null, null],
        ['Black Myth: Wukong', '1920x1200 · Cinematic · minimum Path Tracing', 'DLSS High · FG off', '85W max TGP', 30, null, null],
        ['Black Myth: Wukong', '1920x1200 · Cinematic · RT off', 'Native · FG off', '85W max TGP', 40, null, null]
      ],
      synthetics: [
        ['Cinebench 2024', 'Single-core', 109], ['Cinebench 2024', 'Multi-core', 865]
      ],
      sources: [['Clubic exact-configuration measurements', 'https://www.clubic.com/test-produit-579277-test-gigabyte-gaming-16-un-gamer-abordable-et-competent-sous-rtx-5060.html']]
    },
    'verified-g14-benchmark': {
      title: 'ASUS ROG Zephyrus G14 (2026)',
      configuration: 'GU405AR · Core Ultra 9 386H · RTX 5070 Ti Laptop · 115W max TGP · 32GB RAM · 2880x1800 OLED 120Hz',
      games: [
        ['Cyberpunk 2077', '1920x1080 · Ultra · RT off', 'Native · FSR off · FG off', '115W max TGP', 111.9, null, 88.8],
        ['Baldur\'s Gate 3', '1920x1080 · Ultra', 'Native · TAA · FG off', '115W max TGP', 141.9, 119.1, 90.2],
        ['F1 24', '2560x1440 · Ultra High', 'Native · TAA · FG off', '115W max TGP', 66.5, 54, 56],
        ['Forza Horizon 6', '2560x1440 · Extreme · RT', 'Native · upscaling/FG off', '115W max TGP', 42, null, null],
        ['Forza Horizon 6', '2560x1440 · Extreme · RT', 'DLSS Performance · FG not stated', '115W max TGP', 58, null, null]
      ],
      synthetics: [['PCMark 10', 'Overall', 9049]],
      sources: [['Notebookcheck GU405AR exact-configuration review', 'https://www.notebookcheck.net/One-of-the-best-compact-gaming-laptops-gets-a-brighter-OLED-Asus-ROG-Zephyrus-G14-2026-Review.1321952.0.html']]
    },
    'verified-nitrov16-benchmark': {
      title: 'Acer Nitro V 16S AI (2025)',
      configuration: 'ANV16S-41-R2AJ · Ryzen 7 260 · RTX 5060 Laptop · 85W max graphics power · 32GB DDR5-5600 · 1920x1200 IPS 180Hz',
      games: [
        ['Shadow of the Tomb Raider', '1920x1080 · Highest', 'Native · upscaling/FG not stated', 'TGP not stated by source', 98, null, null],
        ['Shadow of the Tomb Raider', '1920x1200 · Highest', 'Native · upscaling/FG not stated', 'TGP not stated by source', 91, null, null],
        ['Cyberpunk 2077', '1920x1080 · Medium', 'Native · upscaling/FG not stated', 'TGP not stated by source', 32, null, null],
        ['Cyberpunk 2077', '1920x1200 · Medium', 'Native · upscaling/FG not stated', 'TGP not stated by source', 27, null, null],
        ['Far Cry 6', '1920x1080 · Ultra', 'Native · upscaling/FG not stated', 'TGP not stated by source', 82, null, null],
        ['Far Cry 6', '1920x1200 · Ultra', 'Native · upscaling/FG not stated', 'TGP not stated by source', 79, null, null],
        ['Red Dead Redemption 2', '1920x1080 · Medium', 'Native · upscaling/FG not stated', 'TGP not stated by source', 69, null, null],
        ['Borderlands 3', '1920x1080 · Badass', 'Native · upscaling/FG not stated', 'TGP not stated by source', 82, null, null]
      ],
      synthetics: [
        ['Geekbench 6', 'Single-core', 2659], ['Geekbench 6', 'Multi-core', 12837]
      ],
      sources: [['Tom\'s Hardware ANV16S-41-R2AJ exact-configuration review', 'https://www.tomshardware.com/laptops/gaming-laptops/acer-nitro-v-16s-ai-review']]
    },
    'verified-loq15-benchmark': {
      title: 'Lenovo LOQ 15 Gen 10',
      configuration: '15AHP10 · Ryzen 7 250 · RTX 5060 Laptop · 115W max TGP · 16GB DDR5-5600 · 1920x1080 IPS 144Hz',
      games: [
        ['Shadow of the Tomb Raider', '1920x1080 · Highest', 'Native · upscaling/FG off', '115W max TGP', 118, null, null],
        ['Metro Exodus', '1920x1080 · Extreme', 'Native · upscaling/FG off', '115W max TGP', 49, null, null],
        ['Cyberpunk 2077', '1920x1080 · Ultra · RT off', 'Native · upscaling/FG off', '115W max TGP', 91, null, null],
        ['Cyberpunk 2077', '1920x1080 · RT Overdrive', 'Native · upscaling/FG off', '115W max TGP', 17, null, null],
        ['Cyberpunk 2077', '1920x1080 · RT Ultra', 'Native · upscaling/FG off', '115W max TGP', 36, null, null],
        ['Cyberpunk 2077', '1920x1080 · RT Ultra', 'DLSS 4 · FG x2', '115W max TGP', 99, null, null]
      ],
      synthetics: [],
      sources: [
        ['PCWorld exact-configuration measurements', 'https://www.pcworld.com/article/2934656/lenovo-loq-15-review-3.html'],
        ['PC Gamer 15AHP10 configuration verification', 'https://www.pcgamer.com/hardware/gaming-laptops/lenovo-loq-15-gen10-review/']
      ]
    },
    'verified-strixg16-reference-benchmark': {
      title: 'ASUS ROG Strix G16 G615 reference configuration',
      configuration: 'G615 reference test · Core Ultra 9 275HX · RTX 5080 Laptop · 175W max TGP · CPU differs from the 2026 Core Ultra 9 290HX Plus option',
      games: [
        ['Cyberpunk 2077', '1920x1080 · Ultra', 'Native · FSR off · FG off', '175W max TGP', 144.3, null, 118.2],
        ['Cyberpunk 2077', '2560x1440 · Ultra', 'Native · FSR off · FG off', '175W max TGP', 99.5, null, 83.7],
        ['F1 24', '1920x1080 · Ultra High', 'Native · upscaling/FG not stated', '175W max TGP', 127.5, null, 74],
        ['Baldur\'s Gate 3', '1920x1080 · Ultra', 'Native · upscaling/FG not stated', '175W max TGP', 180.3, null, null]
      ],
      synthetics: [],
      sources: [['Notebookcheck G615 reference review', 'https://www.notebookcheck.net/The-RTX-5080-Laptop-is-optimal-for-Gaming-in-WQHD-Asus-ROG-Strix-G16-G615-review.1005904.0.html']]
    },
    'verified-legion7gen11-benchmark': {
      title: 'Lenovo Legion 7 Gen 11',
      configuration: '16AGP11 · Ryzen AI 9 HX 470 · RTX 5060 Laptop · 115W max TGP · 32GB LPDDR5X · 2560x1600 OLED 240Hz',
      games: [
        ['Cyberpunk 2077', '1920x1080 · Ultra', 'Native · FSR off · FG off', '115W max TGP', 90.5, null, 72.4],
        ['Baldur\'s Gate 3', '1920x1080 · Ultra', 'Native · upscaling/FG not stated', '115W max TGP', 112.2, 101.2, null],
        ['GTA V', '1920x1080 · Highest · 4x MSAA', 'Native · upscaling/FG not stated', '115W max TGP', 129.7, 90.9, null],
        ['Strange Brigade', '1920x1080 · Ultra', 'Native · upscaling/FG not stated', '115W max TGP', 223, 165.2, null],
        ['Dota 2 Reborn', '1920x1080 · Ultra', 'Native · upscaling/FG not stated', '115W max TGP', 147.8, null, 124.9]
      ],
      synthetics: [
        ['3DMark Steel Nomad', 'Overall', 2605], ['3DMark Steel Nomad Light', 'Overall', 12141],
        ['3DMark Fire Strike', 'Graphics', 32851], ['3DMark Time Spy', 'Graphics', 12071]
      ],
      sources: [['Notebookcheck 16AGP11 exact-configuration review', 'https://www.notebookcheck.com/Lenovo-Legion-7a-16-G11-Test-Leichter-OLED-Gaming-Laptop-mit-AMD-Ryzen-400.1282924.0.html']]
    },
    'verified-raider16max-benchmark': {
      title: 'MSI Raider 16 Max HX',
      configuration: 'B2WX · Core Ultra 9 290HX Plus · RTX 5090 Laptop · 175W max TGP · 32GB RAM · 2560x1600 OLED 240Hz',
      games: [
        ['Cyberpunk 2077', '2560x1600 · Ultra', 'Balanced upscaling · FG state not stated', '175W max TGP', 132, null, null],
        ['Cyberpunk 2077', '2560x1600 · RT Overdrive', 'DLSS Balanced · FG off', '175W max TGP', 60, null, null],
        ['Shadow of the Tomb Raider', '2560x1600 · Highest', 'Balanced upscaling · FG state not stated', '175W max TGP', 228, null, null],
        ['Total War: Warhammer III', '2560x1600 · Ultra', 'Native · upscaling/FG not stated', '175W max TGP', 80, null, null],
        ['Civilization VII', '2560x1600 · High', 'FSR 3 · FG state not stated', '175W max TGP', 209, null, null]
      ],
      synthetics: [
        ['3DMark Steel Nomad', 'Overall', 6203], ['3DMark Speed Way', 'Overall', 6254],
        ['3DMark Fire Strike', 'Overall', 39894], ['Geekbench 6', 'Single-core', 3114],
        ['Geekbench 6', 'Multi-core', 20638], ['Cinebench 2024', 'Single-core', 134],
        ['Cinebench 2024', 'Multi-core', 2229]
      ],
      sources: [['TechRadar B2WX exact-configuration review', 'https://www.techradar.com/computing/gaming-laptops/msi-raider-16-max-hx-review']]
    }
  };

  const pendingBenchmarkIds = [];

  function valueCell(value, className) {
    const display = value === null || value === undefined ? 'N/A' : value;
    return `<td class="${className || ''}${display === 'N/A' ? ' is-na' : ''}">${display}</td>`;
  }

  function renderModelBenchmark(section, data) {
    if (!section || !data || section.dataset.rendered === 'true') return;
    section.dataset.rendered = 'true';
    section.className = 'verified-benchmark verified-model-benchmark';
    const gameRows = data.games.map(row => `<tr>
      <td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td>
      ${valueCell(row[4], 'fps')}${valueCell(row[5], 'low')}${valueCell(row[6], 'minimum')}
    </tr>`).join('');
    const syntheticBlock = data.synthetics.length ? `
      <section class="verified-bench-group">
        <div class="verified-bench-title"><h4>Synthetic benchmarks</h4><span>Graphics and overall scores remain separate</span></div>
        <div class="verified-table-wrap"><table class="verified-bench-table compact-table">
          <thead><tr><th>Benchmark</th><th>Score type</th><th>Score</th></tr></thead>
          <tbody>${data.synthetics.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td><td>${Number(row[2]).toLocaleString('en-US')}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>` : '<p class="verified-bench-coverage">No exact-configuration synthetic score was published by the cited source. It is intentionally left out rather than estimated.</p>';
    const gamingBlock = data.games.length ? `
      <section class="verified-bench-group">
        <div class="verified-bench-title"><h4>Gaming performance</h4><span>Average FPS · exact settings shown per row</span></div>
        <div class="verified-table-wrap"><table class="verified-bench-table model-results-table">
          <thead><tr><th>Game</th><th>Resolution / preset</th><th>Render mode</th><th>GPU power</th><th>Average</th><th>1% low</th><th>Minimum</th></tr></thead>
          <tbody>${gameRows}</tbody>
        </table></div>
      </section>` : '<p class="verified-bench-coverage">The cited source published exact-configuration synthetic results, but no game result with enough settings detail for this table. FPS is intentionally not estimated.</p>';
    section.innerHTML = `
      <div class="verified-bench-head">
        <div><div class="verified-bench-kicker">Verified published measurements</div><h3>${data.title}</h3></div>
        <span>Updated Jul 13, 2026</span>
      </div>
      <p class="verified-config">${data.configuration}</p>
      <p class="verified-bench-intro">Publisher results for the exact configuration above. Generated FPS is identified separately and should not be compared directly with native rendered FPS. N/A means the source did not publish that metric.</p>
      ${gamingBlock}
      ${syntheticBlock}
      <p class="verified-bench-source">Sources: ${data.sources.map(source => `<a href="${source[1]}" target="_blank" rel="noopener">${source[0]}</a>`).join(' · ')}. Measurements from different publishers are not combined into a single ranking unless settings and methodology match.</p>`;
  }

  function renderPendingBenchmark(section) {
    if (!section || section.dataset.rendered === 'true') return;
    const card = section.closest('.review-card');
    const title = card?.querySelector('.rc-name')?.textContent.trim()
      || document.querySelector('h1')?.textContent.trim()
      || 'Laptop configuration';
    const specs = card?.querySelector('.rc-sub')?.textContent.replace(/\s+/g, ' ').trim()
      || document.querySelector('.asub, .article-subtitle')?.textContent.replace(/\s+/g, ' ').trim()
      || 'Exact configuration not identified';
    section.dataset.rendered = 'true';
    section.className = 'verified-benchmark benchmark-pending';
    section.innerHTML = `
      <div class="verified-bench-head">
        <div><div class="verified-bench-kicker">Evidence audit in progress</div><h3>${title}</h3></div>
        <span>Exact SKU required</span>
      </div>
      <p class="verified-config">${specs}</p>
      <div class="benchmark-pending-grid">
        <div><strong>Average FPS</strong><span>N/A until an exact-configuration source is verified</span></div>
        <div><strong>1% low / minimum</strong><span>N/A — not estimated from a neighboring GPU or CPU</span></div>
        <div><strong>DLSS / FSR / Frame Generation</strong><span>Will be separated by render mode and multiplier</span></div>
        <div><strong>GPU power</strong><span>Maximum TGP and observed gaming power will be labeled separately</span></div>
      </div>
      <p class="bench-evidence-note">The previous comparison used values without sufficient exact-SKU attribution and has been suppressed. A verified table will appear here after resolution, preset, power mode, upscaling, Frame Generation, and source all match. <a href="methodology#benchmark-standard">Benchmark standard</a>.</p>`;
  }

  function renderVerifiedFlagship(section) {
    if (!section || section.dataset.rendered === 'true') return;
    section.dataset.rendered = 'true';
    section.className = 'verified-benchmark';
    section.innerHTML = `
      <div class="verified-bench-head">
        <div>
          <div class="verified-bench-kicker">Verified published measurements</div>
          <h3>Flagship GPU Performance</h3>
        </div>
        <span>Updated Jul 13, 2026</span>
      </div>
      <p class="verified-bench-intro">These are attributed publisher measurements for the exact listed configurations, not FRAMELIMIT lab results. Average, minimum, and 1% low are different metrics. Maximum FPS is excluded because the sources do not report it consistently and a brief peak is less useful than sustained performance.</p>

      <section class="verified-bench-group">
        <div class="verified-bench-title"><h4>Cyberpunk 2077 — Native QHD</h4><span>2560×1440 · Ultra · upscaling off · Frame Generation off</span></div>
        <div class="verified-table-wrap"><table class="verified-bench-table">
          <thead><tr><th>Laptop</th><th>GPU / max TGP</th><th>Average FPS</th><th>1% low</th><th>Minimum</th></tr></thead>
          <tbody>
            <tr><td><i class="bench-dot blue"></i>ASUS Strix SCAR 18</td><td>RTX 5090 · 175W</td>${valueCell(106.8, 'fps')}${valueCell(null, 'low')}${valueCell(87.4, 'minimum')}</tr>
            <tr><td><i class="bench-dot red"></i>Lenovo Legion Pro 7i Gen 10</td><td>RTX 5080 · 175W</td>${valueCell(99.8, 'fps')}${valueCell(81.6, 'low')}${valueCell(85.5, 'minimum')}</tr>
            <tr><td><i class="bench-dot gray"></i>Razer Blade 16 (2025)</td><td>RTX 5090 · 160W</td>${valueCell(98.6, 'fps')}${valueCell(null, 'low')}${valueCell(74.5, 'minimum')}</tr>
          </tbody>
        </table></div>
        <p class="verified-bench-source">Source methodology: Notebookcheck. <a href="${flagshipSources.scar}" target="_blank" rel="noopener">SCAR 18</a> · <a href="${flagshipSources.legion}" target="_blank" rel="noopener">Legion Pro 7i</a> · <a href="${flagshipSources.razer}" target="_blank" rel="noopener">Blade 16</a></p>
      </section>

      <section class="verified-bench-group">
        <div class="verified-bench-title"><h4>Cyberpunk 2077 — DLSS SR Quality</h4><span>2560×1440 · Ultra · Frame Generation off</span></div>
        <div class="verified-table-wrap"><table class="verified-bench-table">
          <thead><tr><th>Laptop</th><th>GPU / max TGP</th><th>Average FPS</th><th>1% low</th><th>Minimum</th><th>Gain vs native</th></tr></thead>
          <tbody>
            <tr><td><i class="bench-dot blue"></i>ASUS Strix SCAR 18</td><td>RTX 5090 · 175W</td>${valueCell(null, 'fps')}${valueCell(null, 'low')}${valueCell(null, 'minimum')}${valueCell(null, 'gain')}</tr>
            <tr><td><i class="bench-dot red"></i>Lenovo Legion Pro 7i Gen 10</td><td>RTX 5080 · 175W</td>${valueCell(119, 'fps')}${valueCell(98.2, 'low')}${valueCell(102.5, 'minimum')}${valueCell('+19.2%', 'gain')}</tr>
            <tr><td><i class="bench-dot gray"></i>Razer Blade 16 (2025)</td><td>RTX 5090 · 160W</td>${valueCell(104.6, 'fps')}${valueCell(null, 'low')}${valueCell(74.9, 'minimum')}${valueCell('+6.1%', 'gain')}</tr>
          </tbody>
        </table></div>
        <p class="verified-bench-source">Matching comparison published in the <a href="${flagshipSources.legion}" target="_blank" rel="noopener">Notebookcheck Legion Pro 7i review</a>. N/A means the same source did not publish a matching SCAR 18 run.</p>
      </section>

      <section class="verified-bench-group">
        <div class="verified-bench-title"><h4>Frame Generation Scaling</h4><span>Displayed FPS · do not compare with rendered/native FPS</span></div>
        <div class="verified-table-wrap"><table class="verified-bench-table mode-table">
          <thead><tr><th>Exact test</th><th>Native</th><th>DLSS only</th><th>FG x2</th><th>MFG x4</th></tr></thead>
          <tbody>
            <tr><td>Blade 16 · QHD Ultra · DLSS Auto</td><td>98.6</td><td>104.3</td><td>189.9</td><td>321.2</td></tr>
            <tr><td>Blade 16 · QHD RT Overdrive · DLSS Auto</td><td>26.8</td><td>58.4</td><td>99.1</td><td>185.1</td></tr>
            <tr><td>Legion Pro 7i · QHD+ RT Overdrive · DLSS Balanced</td><td>28 <small>(14 low)</small></td><td>N/A</td><td>108 <small>(42 low)</small></td><td>164 <small>(34 low)</small></td></tr>
          </tbody>
        </table></div>
        <p class="verified-bench-source"><strong>x2</strong> inserts one generated frame per rendered frame; <strong>x4</strong> can insert three. The Blade and Legion rows use different output resolutions and DLSS modes, so they show scaling within each laptop rather than a direct laptop ranking. Sources: <a href="${flagshipSources.razer}" target="_blank" rel="noopener">Blade 16</a> · <a href="${flagshipSources.legionFg}" target="_blank" rel="noopener">Legion Pro 7i</a>.</p>
      </section>

      <section class="verified-bench-group">
        <div class="verified-bench-title"><h4>3DMark</h4><span>GPU and overall scores must remain separate</span></div>
        <div class="verified-table-wrap"><table class="verified-bench-table">
          <thead><tr><th>Laptop</th><th>Time Spy Graphics</th><th>Time Spy overall</th><th>Steel Nomad</th></tr></thead>
          <tbody>
            <tr><td>ASUS Strix SCAR 18</td><td>24,599</td><td>23,130</td><td>5,883</td></tr>
            <tr><td>Lenovo Legion Pro 7i Gen 10</td><td>23,003</td><td>21,992</td><td class="is-na">N/A</td></tr>
            <tr><td>Razer Blade 16 (2025)</td><td>22,082</td><td>18,898</td><td>5,652</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="dlss-mode-guide">
        <div><strong>DLAA</strong><span>100% input · best image quality, no upscaling</span></div>
        <div><strong>Quality</strong><span>about 67% input · preferred at 1440p</span></div>
        <div><strong>Balanced</strong><span>about 58% input · middle ground</span></div>
        <div><strong>Performance</strong><span>50% input · larger FPS gain</span></div>
        <div><strong>Ultra Performance</strong><span>33% input · intended for very high output resolutions</span></div>
        <p>There is no standard NVIDIA “Ultra Quality” preset. Some games or driver overrides offer custom ratios. <a href="${flagshipSources.dlss}" target="_blank" rel="noopener">NVIDIA mode documentation</a>.</p>
      </section>`;
  }

  function normalizeSettingLabel(tag) {
    const value = tag.textContent.trim();
    const replacements = {
      'DLSS 4 Quality': 'DLSS SR Quality',
      'DLSS 4 Balanced': 'DLSS SR Balanced',
      'DLSS 4 On': 'DLSS SR (mode not stated)',
      'DLSS 4': 'DLSS SR (mode not stated)'
    };
    if (replacements[value]) tag.textContent = replacements[value];
  }

  function createPill(label, value, state) {
    const pill = document.createElement('span');
    pill.className = `bench-context-pill ${state || ''}`.trim();
    pill.innerHTML = `<strong>${label}</strong>${value}`;
    return pill;
  }

  function enhanceLegacySection(section) {
    if (section.dataset.benchmarkEnhanced === 'true') return;
    section.dataset.benchmarkEnhanced = 'true';

    const title = section.querySelector('.hbench-title');
    if (title) title.textContent = 'PUBLISHED FPS COMPARISON';

    section.querySelectorAll('.hbench-setting-tag.dlss').forEach(normalizeSettingLabel);

    const tags = Array.from(section.querySelectorAll('.hbench-setting-tag'))
      .map(tag => tag.textContent.toLowerCase());
    const hasFrameGeneration = tags.some(tag => /frame|mfg|\bfg\b/.test(tag));
    const hasUpscaling = tags.some(tag => /dlss|fsr|xess/.test(tag));

    const context = document.createElement('div');
    context.className = 'bench-context';
    context.appendChild(createPill('Metric', 'Average FPS', 'ok'));
    context.appendChild(createPill('1% low', 'Not available', 'missing'));
    context.appendChild(createPill(
      'Upscaling',
      hasUpscaling ? 'Shown per game' : 'Native / not stated',
      hasUpscaling ? 'ok' : 'missing'
    ));
    context.appendChild(createPill(
      'Frame gen',
      hasFrameGeneration ? 'Included only where tagged' : 'Off / not stated',
      hasFrameGeneration ? 'generated' : 'missing'
    ));

    const resolution = section.querySelector('.hbench-resolution');
    if (resolution) resolution.insertAdjacentElement('afterend', context);
    else section.insertBefore(context, section.firstChild);

    const note = document.createElement('p');
    note.className = 'bench-evidence-note';
    note.innerHTML = 'Legacy normalized comparison. Generated FPS is separated only when the source settings identify frame generation. Missing 1% lows, latency, driver, or source details are not estimated. <a href="methodology#benchmark-standard">Benchmark standard</a>.';
    section.appendChild(note);
  }

  function enhanceLegacyTable(table) {
    if (table.closest('.hbench') || table.dataset.benchmarkEnhanced === 'true') return;
    table.dataset.benchmarkEnhanced = 'true';

    table.querySelectorAll('.hbench-setting-tag.dlss').forEach(normalizeSettingLabel);

    const wrapper = table.closest('.bench-wrap, .bench-table-wrap') || table.parentElement;
    if (!wrapper || wrapper.querySelector('.bench-evidence-note')) return;

    const note = document.createElement('p');
    note.className = 'bench-evidence-note';
    note.innerHTML = 'Legacy published comparison. Source configuration, preset, upscaling, frame generation, driver, and 1% lows are shown only when the original evidence identifies them; missing values are not estimated. <a href="methodology#benchmark-standard">Benchmark standard</a>.';
    wrapper.appendChild(note);
  }

  function renderStandardOverview(root) {
    if (!root || root.dataset.rendered === 'true') return;
    root.dataset.rendered = 'true';
    root.innerHTML = `
      <div class="bench-standard-head">
        <div>
          <div class="bench-standard-label">Benchmark Standard ${standard.version}</div>
          <h2>How to read the FPS charts</h2>
        </div>
        <a href="methodology#benchmark-standard">Full methodology &rarr;</a>
      </div>
      <div class="bench-standard-grid">
        <div><strong>Rendered FPS</strong><span>Native or upscaled frames produced by the game engine.</span></div>
        <div><strong>Generated FPS</strong><span>Frame Generation and MFG results stay separate from rendered performance.</span></div>
        <div><strong>1% lows</strong><span>Shown only when the original source reports them under matching settings.</span></div>
        <div><strong>Synthetic tests</strong><span>Steel Nomad for raster; Speed Way or Port Royal for ray tracing.</span></div>
      </div>
      <div class="bench-tech-wrap">
        <table class="bench-tech-table">
          <thead><tr><th>GPU family</th><th>Upscaling</th><th>Frame generation</th><th>Latency</th><th>Reporting note</th></tr></thead>
          <tbody>${technologies.map(item => `
            <tr>
              <td>${item.family}</td>
              <td>${item.upscaling}</td>
              <td>${item.frameGeneration}</td>
              <td>${item.latency}</td>
              <td>${item.note}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function init() {
    renderVerifiedFlagship(document.getElementById('verified-flagship-benchmark'));
    Object.keys(modelBenchmarks).forEach(id => {
      renderModelBenchmark(document.getElementById(id), modelBenchmarks[id]);
    });
    pendingBenchmarkIds.forEach(id => renderPendingBenchmark(document.getElementById(id)));
    document.querySelectorAll('.hbench').forEach(enhanceLegacySection);
    document.querySelectorAll('.bench-table').forEach(enhanceLegacyTable);
    renderStandardOverview(document.getElementById('benchmark-standard-root'));
  }

  window.FL_BENCHMARK_STANDARD = standard;
  window.FL_GPU_TECHNOLOGIES = technologies;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
