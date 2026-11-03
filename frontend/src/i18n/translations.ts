import { Language } from '../types';

export interface Translations {
  header: {
    title: string;
    subtitle: string;
    challengeTag: string;
    selectLanguage: string;
  };
  nav: {
    places: string;
    reportMissing: string;
    foundMissing: string;
    reportEmergency: string;
    dosDonts: string;
    backToMap: string;
  };
  map: {
    title: string;
    subtext: string;
    controls: string;
    zoomIn: string;
    zoomOut: string;
    resetView: string;
    mode2D: string;
    mode3D: string;
    currentLocation: string;
    illustrativeNotice: string;
  };
  places: {
    title: string;
    searchPlaceholder: string;
    allCategories: string;
    categories: {
      gates: string;
      busStops: string;
      parking: string;
      temples: string;
      ghats: string;
      toilets: string;
      helpCentres: string;
      announcements: string;
      lockers: string;
      foodStalls: string;
      poojaStalls: string;
      poojaAreas: string;
      medical: string;
      water: string;
      waitingHalls: string;
      other: string;
    };
    noResults: string;
    viewOnMap: string;
    getDirections: string;
  };
  statuses: {
    illustrative_sample: string;
    historical_reference: string;
    pending_verification: string;
    officially_verified: string;
  };
  emergency: {
    title: string;
    subtext: string;
    directCallNotice: string;
    call112: string;
    call108: string;
    formNotice: string;
    categoryLabel: string;
    descriptionLabel: string;
    contactLabel: string;
    submitButton: string;
    sosModalTitle: string;
    sosModalSubtitle: string;
    officialHotlinesTitle: string;
    call112Desc: string;
    call108Desc: string;
    controlRoomDesc: string;
    nearestAidTitle: string;
    nearestMedicalTitle: string;
    nearestPoliceTitle: string;
    walkDirectionsButton: string;
    distanceAway: string;
    estimatedWalkTime: string;
    walkDisclaimer: string;
    locationStatusLive: string;
    locationStatusUnavailable: string;
    detectGpsButton: string;
    selectManualLandmark: string;
    manualLandmarkNotice: string;
    reportToControlRoomButton: string;
    emergencyAudioMutedNotice: string;
    closeButton: string;
  };
  missingPerson: {
    title: string;
    subtext: string;
    nameLabel: string;
    ageLabel: string;
    lastSeenLabel: string;
    contactLabel: string;
    submitButton: string;
    privacyNotice: string;
  };
  foundPerson: {
    title: string;
    subtext: string;
    descriptionLabel: string;
    locationLabel: string;
    contactLabel: string;
    submitButton: string;
  };
  dosDonts: {
    title: string;
    subtext: string;
    dosTitle: string;
    dontsTitle: string;
    citation: string;
  };
  gps: {
    locateMe: string;
    locating: string;
    liveLocation: string;
    permissionDenied: string;
    unavailable: string;
    timeout: string;
    unsupported: string;
    accuracyLabel: string;
    meters: string;
    selectManualStart: string;
    manualStartNotice: string;
    httpsRequirementNotice: string;
  };
  navigation: {
    directions: string;
    routeToFacility: string;
    startNavigation: string;
    stopNavigation: string;
    arrivedTitle: string;
    arrivedDesc: string;
    origin: string;
    destination: string;
    distance: string;
    estimatedTime: string;
    minutes: string;
    stepByStep: string;
    pedestrianNetworkNotice: string;
    approximateNotice: string;
    selectOriginTitle: string;
    useMyGps: string;
    orChooseLandmark: string;
    outsideGeofenceNotice: string;
    outsideGeofenceDesc: string;
    changeGateBtn: string;
    offRouteNotice: string;
    recenter: string;
    routeOverview: string;
    walkingSpeedNote: string;
    eta: string;
  };
  qr: {
    scanQrBtn: string;
    viewQrBtn: string;
    scannerTitle: string;
    scannerSubtitle: string;
    scannerHelp: string;
    generatorTitle: string;
    generatorSubtitle: string;
    downloadPng: string;
    printSign: string;
    copyLink: string;
    copied: string;
    invalidQrNotice: string;
    cameraErrorNotice: string;
    enterCodeManual: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    header: {
      title: 'GODAVARI PUSHKARALU 2027',
      subtitle: 'GIS-Based Civic Infrastructure & Facility Navigation System',
      challengeTag: 'AP Govt Innovation Challenge — PS-09',
      selectLanguage: 'Language',
    },
    nav: {
      places: 'Places',
      reportMissing: 'Report a Missing Person',
      foundMissing: 'Found a Missing Person',
      reportEmergency: 'Report an Emergency',
      dosDonts: "Do's & Don'ts",
      backToMap: '← Back to Map View',
    },
    map: {
      title: 'Interactive Event Map (Godavari Riverfront, Rajahmundry)',
      subtext: 'Illustrative 3D mapping & spatial facility directory for Pushkaralu 2027',
      controls: 'Map Controls',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      resetView: 'Reset View',
      mode2D: '2D Map',
      mode3D: '3D View',
      currentLocation: 'My Location',
      illustrativeNotice: 'Note: Event layout geometry and stall placements are illustrative models for development and demonstration. Official 2027 government layouts will be imported upon publication.',
    },
    places: {
      title: 'Civic Facilities & Stalls Directory',
      searchPlaceholder: 'Search facilities, ghats, medical centres, stalls...',
      allCategories: 'All Categories',
      categories: {
        gates: 'Gates & Entrances',
        busStops: 'Bus Stops & Transport',
        parking: 'Parking Areas',
        temples: 'Temples & Worship',
        ghats: 'Numbered Ghats',
        toilets: 'Toilets & Washrooms',
        helpCentres: 'Help & Information Centres',
        announcements: 'Public Announcements',
        lockers: 'Lockers & Cloak Rooms',
        foodStalls: 'Individual Food Stalls',
        poojaStalls: 'Pooja Item Stalls',
        poojaAreas: 'Pooja & Ritual Areas',
        medical: 'Medical & First Aid Centres',
        water: 'Drinking Water Points',
        waitingHalls: 'Pilgrim Shelters & Halls',
        other: 'Other Civic Facilities',
      },
      noResults: 'No facilities found matching your search.',
      viewOnMap: 'View on Map',
      getDirections: 'Get Directions',
    },
    statuses: {
      illustrative_sample: 'Illustrative Sample (Development)',
      historical_reference: 'Historical Ground Reference',
      pending_verification: 'Pending 2027 Official Survey',
      officially_verified: 'Officially Verified Site',
    },
    emergency: {
      title: 'Report an Emergency',
      subtext: 'Direct alerting to Pushkaralu Master Control Room',
      directCallNotice: 'CRITICAL: For immediate life-safety emergencies, dial official hotlines directly:',
      call112: 'Dial 112 (Police / All Emergencies)',
      call108: 'Dial 108 (Ambulance & Medical Dispatch)',
      formNotice: 'Submitting this form dispatches an alert to the Rajahmundry Pushkaralu Command Control Centre. It does not replace dialing 112.',
      categoryLabel: 'Incident Category',
      descriptionLabel: 'Situation Details',
      contactLabel: 'Your Mobile Contact',
      submitButton: 'Dispatch Emergency Alert',
      sosModalTitle: 'EMERGENCY SOS & IMMEDIATE AID',
      sosModalSubtitle: 'Direct Emergency Hotlines & Nearest Helpdesks',
      officialHotlinesTitle: 'Official Emergency Hotlines (Immediate Dial)',
      call112Desc: 'National Emergency Support (Police, Fire, Disaster Response) — Toll Free',
      call108Desc: 'Free Ambulance & Medical Emergency Service — Toll Free 24/7',
      controlRoomDesc: 'Pushkaralu Riverfront Control Room & Command Desk',
      nearestAidTitle: 'Nearest On-Ground Aid Stations (Auto-Detected)',
      nearestMedicalTitle: 'Nearest First Aid & Medical Booth',
      nearestPoliceTitle: 'Nearest Police Outpost / Helpdesk',
      walkDirectionsButton: 'Walk to Aid Station',
      distanceAway: 'away',
      estimatedWalkTime: 'est. walk',
      walkDisclaimer: 'Estimated unimpeded walking time (geometric calculation at 1.15 m/s) — Not an official emergency responder dispatch guarantee.',
      locationStatusLive: 'Live GPS Active',
      locationStatusUnavailable: 'GPS Location Unavailable',
      detectGpsButton: 'Detect My GPS Location',
      selectManualLandmark: 'Or Select Your Landmark / Ghat:',
      manualLandmarkNotice: 'Reference location selected',
      reportToControlRoomButton: 'Submit Digital Incident Report to Control Room',
      emergencyAudioMutedNotice: 'Emergency alert triggered. Background audio guide has been muted.',
      closeButton: 'Close Emergency HUD',
    },
    missingPerson: {
      title: 'Report a Missing Person',
      subtext: 'Submit details to the Pushkaralu Missing Persons & Lost Child Registry',
      nameLabel: 'Full Name of Missing Person',
      ageLabel: 'Age / Approximate Age',
      lastSeenLabel: 'Last Seen Location / Ghat',
      contactLabel: 'Guardian / Reporter Contact Number',
      submitButton: 'Submit Missing Person Report',
      privacyNotice: 'Submitted reports are securely transmitted to AP Police helpdesks and PA announcement towers across the riverfront.',
    },
    foundPerson: {
      title: 'Found a Missing Person or Child',
      subtext: 'Alert volunteers and helpdesks to an unaccompanied person',
      descriptionLabel: 'Description / Clothing / Identifiers',
      locationLabel: 'Current Safe Location / Helpdesk',
      contactLabel: 'Finder Contact Number',
      submitButton: 'Submit Found Report',
    },
    dosDonts: {
      title: 'Pilgrim Safety Guidelines — Do’s & Don’ts',
      subtext: 'Essential public safety protocols for sacred Godavari Pushkaralu bathing and rituals',
      dosTitle: 'Recommended Practices (Do’s)',
      dontsTitle: 'Strict Prohibitions (Don’ts)',
      citation: 'Guidelines adapted from National Disaster Management Authority (NDMA) Crowd Management Protocols and AP Disaster Management Authority.',
    },
    gps: {
      locateMe: 'Locate My Device',
      locating: 'Locating device via GPS...',
      liveLocation: 'Live Device GPS',
      permissionDenied: 'Location access was denied. You can select a starting gate or landmark manually.',
      unavailable: 'Device GPS location unavailable. Please check location permissions or choose a starting point.',
      timeout: 'Location request timed out. Please try again or select a starting landmark.',
      unsupported: 'Geolocation is not supported by this browser.',
      accuracyLabel: 'Accuracy',
      meters: 'm',
      selectManualStart: 'Select Starting Point',
      manualStartNotice: 'Manual Starting Point Selected',
      httpsRequirementNotice: 'Note: Device Geolocation requires HTTPS in production (localhost is supported for testing).',
    },
    navigation: {
      directions: 'Get Walking Directions',
      routeToFacility: 'Route to This Facility',
      startNavigation: 'Start Walking Guidance',
      stopNavigation: 'Exit Navigation',
      arrivedTitle: 'You Have Arrived!',
      arrivedDesc: 'You are within the arrival radius of this facility.',
      origin: 'Start Point',
      destination: 'Destination',
      distance: 'Total Distance',
      estimatedTime: 'Est. Walk Time',
      minutes: 'mins',
      stepByStep: 'Walking Turn Directions',
      pedestrianNetworkNotice: 'Route calculated along the designated Pushkaralu riverfront pedestrian grid. Barricade layouts subject to police crowd control deployment.',
      approximateNotice: 'Direct pedestrian link (corridor under official verification).',
      selectOriginTitle: 'Choose Your Starting Location',
      useMyGps: 'Use My Current Device GPS',
      orChooseLandmark: 'Or choose an entrance gate / landmark:',
      outsideGeofenceNotice: 'You are outside the event grounds',
      outsideGeofenceDesc: 'Pedestrian route is starting from Central Main Gate 02 (Pushkar Arch).',
      changeGateBtn: 'Change Gate',
      offRouteNotice: 'Off Route • Recalculating fastest path...',
      recenter: 'Re-center',
      routeOverview: 'Route Overview',
      walkingSpeedNote: 'Walking pace 1.2 m/s',
      eta: 'ETA',
    },
    qr: {
      scanQrBtn: 'Scan QR Sign',
      viewQrBtn: 'View Facility QR',
      scannerTitle: 'Scan Pushkaralu Facility QR',
      scannerSubtitle: 'Point your phone camera at any physical QR sign placed at stalls, ghats, or entry gates.',
      scannerHelp: 'Scanning a QR code instantly focuses the 3D map on the facility and displays directions, without overriding your real GPS.',
      generatorTitle: 'Official Facility QR Signage',
      generatorSubtitle: 'Print-ready QR signage for stall operators and site officials.',
      downloadPng: 'Download High-Res QR',
      printSign: 'Print Official Signage Sheet',
      copyLink: 'Copy Deep Link',
      copied: 'Link Copied!',
      invalidQrNotice: 'Unrecognized QR code reference. Returned to main event map.',
      cameraErrorNotice: 'Camera access unavailable. You can enter the stall ID manually or choose from directory.',
      enterCodeManual: 'Enter Facility / Stall ID Manually:',
    },
  },
  te: {
    header: {
      title: 'గోదావరి పుష్కరాలు 2027',
      subtitle: 'జిఐఎస్ ఆధారిత పౌర మౌలిక వసతులు & నావిగేషన్ వ్యవస్థ',
      challengeTag: 'ఆంధ్రప్రదేశ్ ప్రభుత్వ ఇన్నోవేషన్ ఛాలెంజ్ — PS-09',
      selectLanguage: 'భాష',
    },
    nav: {
      places: 'ప్రదేశాలు & సదుపాయాలు',
      reportMissing: 'తప్పిపోయిన వ్యక్తి నివేదిక',
      foundMissing: 'దొరికిన వ్యక్తి సమాచారం',
      reportEmergency: 'అత్యవసర నివేదిక',
      dosDonts: 'చేయవలసినవి & చేయకూడనివి',
      backToMap: '← మ్యాప్ వీక్షణకు తిరిగి వెళ్లండి',
    },
    map: {
      title: 'ఇంటరాక్టివ్ ఈవెంట్ మ్యాప్ (రాజమండ్రి గోదావరి తీరం)',
      subtext: 'పుష్కరాలు 2027 కోసం నమూనా 3D మ్యాపింగ్ మరియు సదుపాయాల డైరెక్టరీ',
      controls: 'మ్యాప్ నియంత్రణలు',
      zoomIn: 'జూమ్ ఇన్',
      zoomOut: 'జూమ్ అవుట్',
      resetView: 'రీసెట్ చేయండి',
      mode2D: '2D మ్యాప్',
      mode3D: '3D వీక్షణ',
      currentLocation: 'నా ప్రస్తుత స్థానం',
      illustrativeNotice: 'గమనిక: ఈవెంట్ లేఅవుట్ మరియు స్టాల్ స్థానాలు డెవలప్‌మెంట్ మరియు ప్రదర్శన కోసం నమూనాలు మాత్రమే. అధికారిక 2027 ప్రభుత్వ ప్రణాళిక ప్రచురించబడిన తర్వాత అప్‌డేట్ చేయబడుతుంది.',
    },
    places: {
      title: 'సౌకర్యాలు & స్టాళ్ల డైరెక్టరీ',
      searchPlaceholder: 'ఘాట్‌లు, వైద్య కేంద్రాలు, స్టాళ్లు, సదుపాయాలు శోధించండి...',
      allCategories: 'అన్ని విభాగాలు',
      categories: {
        gates: 'ప్రవేశ ద్వారాలు',
        busStops: 'బస్ స్టాప్‌లు & రవాణా',
        parking: 'పార్కింగ్ ప్రాంతాలు',
        temples: 'దేవాలయాలు & పూజా స్థలాలు',
        ghats: 'సంఖ్యతో కూడిన ఘాట్‌లు',
        toilets: 'శౌచాలయాలు',
        helpCentres: 'సహాయ కేంద్రాలు',
        announcements: 'ప్రకటనల కేంద్రాలు',
        lockers: 'లాకర్లు & భద్రతా గదులు',
        foodStalls: 'ఆహార స్టాళ్లు',
        poojaStalls: 'పూజా సామగ్రి దుకాణాలు',
        poojaAreas: 'పిండ ప్రదాన / పూజా స్థలాలు',
        medical: 'వైద్య & ప్రథమ చికిత్సా కేంద్రాలు',
        water: 'తాగునీటి కేంద్రాలు',
        waitingHalls: 'నిరీక్షణ మందిరాలు',
        other: 'ఇతర పౌర సదుపాయాలు',
      },
      noResults: 'మీ శోధనకు సంబంధించిన ఫలితాలు కనుగొనబడలేదు.',
      viewOnMap: 'మ్యాప్‌లో చూడండి',
      getDirections: 'మార్గం చూపించండి',
    },
    statuses: {
      illustrative_sample: 'నమూనా ప్రాజెక్ట్ డేటా (Sample)',
      historical_reference: 'చారిత్రక ప్రాధాన్యత కలిగిన ప్రదేశం',
      pending_verification: 'అధికారిక సర్వే పరిశీలనలో ఉంది',
      officially_verified: 'ప్రభుత్వ ధృవీకరించిన ప్రదేశం',
    },
    emergency: {
      title: 'అత్యవసర సహాయం కోసం నివేదించండి',
      subtext: 'కంట్రోల్ రూమ్‌కు తక్షణ సమాచారం పంపబడుతుంది',
      directCallNotice: 'ముఖ్యమైనది: అత్యవసర సమయాల్లో నేరుగా అధికారిక నంబర్లకు కాల్ చేయండి:',
      call112: '112 కు కాల్ చేయండి (పోలీస్ / అన్ని అత్యవసరాలు)',
      call108: '108 కు కాల్ చేయండి (అంబులెన్స్ & వైద్య సేవలు)',
      formNotice: 'ఈ ఫారమ్ రాజమండ్రి పుష్కరాల కమాండ్ కంట్రోల్ రూమ్‌కు హెచ్చరికను పంపుతుంది. ఇది 112 కు ప్రత్యామ్నాయం కాదు.',
      categoryLabel: 'అత్యవసర విభాగం',
      descriptionLabel: 'పరిస్థితి వివరాలు',
      contactLabel: 'మీ మొబైల్ నంబర్',
      submitButton: 'అత్యవసర హెచ్చరికను పంపండి',
      sosModalTitle: 'అత్యవసర SOS & తక్షణ సహాయం',
      sosModalSubtitle: 'నేరుగా అత్యవసర హాట్‌లైన్లు & సమీప సహాయ కేంద్రాలు',
      officialHotlinesTitle: 'అధికారిక అత్యవసర హాట్‌లైన్లు (వెంటనే కాల్ చేయండి)',
      call112Desc: 'జాతీయ అత్యవసర సహాయం (పోలీస్, ఫైర్, విపత్తు రక్షణ) — ఉచితం (Toll-Free)',
      call108Desc: 'ఉచిత అంబులెన్స్ & అత్యవసర వైద్య సేవలు — 24/7 ఉచితం',
      controlRoomDesc: 'పుష్కరాల నదీతీర ప్రధాన కంట్రోల్ రూమ్ & కమాండ్ డెస్క్',
      nearestAidTitle: 'సమీపంలోని ప్రత్యక్ష సహాయ కేంద్రాలు (ఆటోమేటిక్ లెక్కింపు)',
      nearestMedicalTitle: 'సమీప ప్రథమ చికిత్స & వైద్య బూత్',
      nearestPoliceTitle: 'సమీప పోలీస్ ఔట్‌పోస్ట్ / సహాయ డెస్క్',
      walkDirectionsButton: 'సహాయ కేంద్రానికి నడిచే మార్గం',
      distanceAway: 'దూరంలో',
      estimatedWalkTime: 'సుమారు నడక సమయం',
      walkDisclaimer: 'అంచనా వేసిన నడక సమయం (1.15 మీ/సెకను వేగంతో) — ఇది అధికారిక రెస్పాండర్ వచ్చే సమయానికి హామీ కాదు.',
      locationStatusLive: 'ప్రత్యక్ష GPS అందుబాటులో ఉంది',
      locationStatusUnavailable: 'GPS స్థానం లభించలేదు',
      detectGpsButton: 'నా GPS స్థానాన్ని కనుగొనండి',
      selectManualLandmark: 'లేదా మీ సమీప ల్యాండ్‌మార్క్/ఘాట్‌ను ఎంచుకోండి:',
      manualLandmarkNotice: 'ఎంచుకున్న ల్యాండ్‌మార్క్ ఆధారంగా లెక్కింపు',
      reportToControlRoomButton: 'కంట్రోల్ రూమ్‌కు ఆన్‌లైన్ నివేదిక పంపండి',
      emergencyAudioMutedNotice: 'అత్యవసర హెచ్చరిక ప్రారంభమైంది. ఆడియో గైడ్ మ్యూట్ చేయబడింది.',
      closeButton: 'మూసివేయండి',
    },
    missingPerson: {
      title: 'తప్పిపోయిన వ్యక్తి వివరాలను నమోదు చేయండి',
      subtext: 'పుష్కరాల మిస్సింగ్ పర్సన్స్ కంట్రోల్ డెస్క్‌కు వివరాలు పంపండి',
      nameLabel: 'తప్పిపోయిన వ్యక్తి పూర్తి పేరు',
      ageLabel: 'వయస్సు / సుమారు వయస్సు',
      lastSeenLabel: 'చివరిగా కనిపించిన ప్రదేశం / ఘాట్',
      contactLabel: 'సంరక్షకుని / రిపోర్టర్ మొబైల్ నంబర్',
      submitButton: 'రిపోర్ట్ సమర్పించండి',
      privacyNotice: 'నమోదు చేసిన వివరాలు గోప్యంగా ఉంచబడతాయి మరియు సహాయ కేంద్రాలు, అనౌన్స్‌మెంట్ టవర్లకు పంపబడతాయి.',
    },
    foundPerson: {
      title: 'దొరికిన ఒంటరి వ్యక్తి సమాచారం',
      subtext: 'రక్షణ డెస్క్‌కు ఒంటరిగా ఉన్న పిల్లలు లేదా వ్యక్తుల వివరాలను పంపండి',
      descriptionLabel: 'శరీర గుర్తులు / దుస్తులు / వివరాలు',
      locationLabel: 'ప్రస్తుత సురక్షిత ప్రదేశం / సహాయ డెస్క్',
      contactLabel: 'కనుగొన్న వ్యక్తి మొబైల్ నంబర్',
      submitButton: 'వివరాలు సమర్పించండి',
    },
    dosDonts: {
      title: 'భక్తుల భద్రతా మార్గదర్శకాలు — చేయవలసినవి & చేయకూడనివి',
      subtext: 'గోదావరి పుష్కరాల పవిత్ర స్నానాలు మరియు దర్శనాల సమయంలో పాటించవలసిన నిబంధనలు',
      dosTitle: 'చేయవలసిన పనులు (Do’s)',
      dontsTitle: 'చేయకూడని పనులు (Don’ts)',
      citation: 'జాతీయ విపత్తు నిర్వహణ సంస్థ (NDMA) మరియు ఆంధ్రప్రదేశ్ ప్రభుత్వ మార్గదర్శకాల ఆధారంగా రూపొందించబడింది.',
    },
    gps: {
      locateMe: 'నా ప్రస్తుత స్థానం కనుగొనండి',
      locating: 'జిపిఎస్ ద్వారా స్థానం శోధిస్తోంది...',
      liveLocation: 'ప్రత్యక్ష పరికర స్థానం (Live GPS)',
      permissionDenied: 'లొకేషన్ అనుమతి నిరాకరించబడింది. మీరు ప్రారంభ గేట్ లేదా ల్యాండ్‌మార్క్‌ను మాన్యువల్‌గా ఎంచుకోవచ్చు.',
      unavailable: 'జిపిఎస్ స్థానం లభించలేదు. దయచేసి అనుమతులు తనిఖీ చేయండి లేదా ప్రారంభ స్థానాన్ని ఎంచుకోండి.',
      timeout: 'లొకేషన్ రిక్వెస్ట్ సమయం ముగిసింది. దయచేసి మళ్లీ ప్రయత్నించండి.',
      unsupported: 'ఈ బ్రౌజర్‌లో జియోలొకేషన్ సదుపాయం అందుబాటులో లేదు.',
      accuracyLabel: 'ఖచ్చితత్వం',
      meters: 'మీ.',
      selectManualStart: 'ప్రారంభ స్థానాన్ని ఎంచుకోండి',
      manualStartNotice: 'మాన్యువల్ ప్రారంభ స్థానం ఎంచుకోబడింది',
      httpsRequirementNotice: 'గమనిక: పరికర జియోలొకేషన్‌కు ప్రొడక్షన్‌లో HTTPS అవసరం (డెవలప్‌మెంట్‌కు localhost మినహాయింపు).',
    },
    navigation: {
      directions: 'నడక మార్గం చూడండి',
      routeToFacility: 'ఈ సదుపాయానికి మార్గం',
      startNavigation: 'నడక మార్గదర్శకత్వం ప్రారంభించండి',
      stopNavigation: 'నావిగేషన్ ముగించండి',
      arrivedTitle: 'మీరు గమ్యస్థానానికి చేరుకున్నారు!',
      arrivedDesc: 'మీరు ఈ సదుపాయం వద్దకు చేరుకున్నారు.',
      origin: 'ప్రారంభ స్థానం',
      destination: 'గమ్యస్థానం',
      distance: 'మొత్తం దూరం',
      estimatedTime: 'సుమారు నడక సమయం',
      minutes: 'నిమిషాలు',
      stepByStep: 'దశలవారీ నడక సూచనలు',
      pedestrianNetworkNotice: 'గోదావరి తీర నడక మార్గాల గ్రిడ్ ఆధారంగా రూపొందించిన మార్గం. రద్దీ నియంత్రణ బారికేడ్ల ఆధారంగా మారవచ్చు.',
      approximateNotice: 'ప్రత్యక్ష నడక లింక్ (పోలీస్ పరిశీలనలో ఉంది).',
      selectOriginTitle: 'మీ ప్రారంభ స్థానాన్ని ఎంచుకోండి',
      useMyGps: 'నా ప్రత్యక్ష పరికర జిపిఎస్ స్థానం ఉపయోగించండి',
      orChooseLandmark: 'లేదా సమీప ప్రవేశ ద్వారం / స్థలాన్ని ఎంచుకోండి:',
      outsideGeofenceNotice: 'మీరు ప్రస్తుతం పుష్కర ప్రాంగణానికి వెలుపల ఉన్నారు',
      outsideGeofenceDesc: 'పాదచారుల మార్గం కేంద్ర ప్రధాన ద్వారం 02 (పుష్కర్ ఆర్చ్) నుండి ప్రారంభమవుతోంది.',
      changeGateBtn: 'ద్వారం మార్చండి',
      offRouteNotice: 'దారి మారింది • సరికొత్త మార్గాన్ని లెక్కిస్తోంది...',
      recenter: 'రీ-సెంటర్',
      routeOverview: 'రూట్ అవలోకనం',
      walkingSpeedNote: 'నడక వేగం ~1.2 మీ/సె',
      eta: 'ఈటీఏ',
    },
    qr: {
      scanQrBtn: 'క్యూఆర్ కోడ్ స్కాన్ చేయండి',
      viewQrBtn: 'సదుపాయం క్యూఆర్ చూడండి',
      scannerTitle: 'పుష్కరాల క్యూఆర్ కోడ్ స్కానర్',
      scannerSubtitle: 'స్టాళ్లు, ఘాట్‌లు లేదా గేట్ల వద్ద ఉన్న బోర్డులపై క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి.',
      scannerHelp: 'క్యూఆర్ స్కాన్ చేస్తే మ్యాప్‌లో ఆ సదుపాయం నేరుగా కనిపిస్తుంది (ఇది మీ జిపిఎస్ స్థానాన్ని మార్చదు).',
      generatorTitle: 'అధికారిక సదుపాయం క్యూఆర్ బోర్డు',
      generatorSubtitle: 'స్టాల్ నిర్వాహకులు మరియు అధికారుల కోసం ప్రింట్ చేయదగిన క్యూఆర్ కోడ్.',
      downloadPng: 'క్యూఆర్ డౌన్‌లోడ్ చేయండి',
      printSign: 'అధికారిక బోర్డు ప్రింట్ చేయండి',
      copyLink: 'లింక్ కాపీ చేయండి',
      copied: 'లింక్ కాపీ చేయబడింది!',
      invalidQrNotice: 'గుర్తించబడని క్యూఆర్ కోడ్. ప్రధాన మ్యాప్‌కు పంపబడింది.',
      cameraErrorNotice: 'కెమెరా అందుబాటులో లేదు. మీరు స్టాల్ ఐడీని నమోదు చేయవచ్చు.',
      enterCodeManual: 'స్టాల్ / సదుపాయం ఐడీని నమోదు చేయండి:',
    },
  },
  hi: {
    header: {
      title: 'गोदावरी पुष्करालु 2027',
      subtitle: 'जीआईएस-आधारित नागरिक अवसंरचना एवं सुविधा नेविगेशन प्रणाली',
      challengeTag: 'आंध्र प्रदेश सरकार नवाचार चुनौती — PS-09',
      selectLanguage: 'भाषा',
    },
    nav: {
      places: 'स्थान एवं सुविधाएं',
      reportMissing: 'लापता व्यक्ति की रिपोर्ट',
      foundMissing: 'मिले हुए व्यक्ति की सूचना',
      reportEmergency: 'आपातकालीन रिपोर्ट',
      dosDonts: 'क्या करें और क्या न करें',
      backToMap: '← मानचित्र पर वापस जाएं',
    },
    map: {
      title: 'इंटरएक्टिव इवेंट मैप (राजमुंदरी गोदावरी तट)',
      subtext: 'पुष्करालु 2027 हेतु प्रतीकात्मक 3D मैपिंग एवं सुविधा निर्देशिका',
      controls: 'मानचित्र नियंत्रण',
      zoomIn: 'ज़ूम इन',
      zoomOut: 'ज़ूम आउट',
      resetView: 'रीसेट करें',
      mode2D: '2D मैप',
      mode3D: '3D दृश्य',
      currentLocation: 'मेरा स्थान',
      illustrativeNotice: 'सूचना: यह लेआउट और स्टॉल स्थान विकास और प्रदर्शन हेतु नमूना मॉडल हैं। 2027 की आधिकारिक सरकारी योजना जारी होने पर इसे अपडेट किया जाएगा।',
    },
    places: {
      title: 'सुविधाएं एवं स्टॉल निर्देशिका',
      searchPlaceholder: 'घाट, चिकित्सा केंद्र, स्टॉल, सुविधाएं खोजें...',
      allCategories: 'सभी श्रेणियां',
      categories: {
        gates: 'प्रवेश द्वार',
        busStops: 'बस स्टॉप एवं परिवहन',
        parking: 'पार्किंग क्षेत्र',
        temples: 'मंदिर एवं पूजा स्थल',
        ghats: 'क्रमांकित घाट',
        toilets: 'शौचालय',
        helpCentres: 'सहायता एवं सूचना केंद्र',
        announcements: 'सार्वजनिक घोषणा केंद्र',
        lockers: 'लॉकर एवं क्लॉक रूम',
        foodStalls: 'खाद्य स्टॉल',
        poojaStalls: 'पूजा सामग्री की दुकानें',
        poojaAreas: 'पूजा एवं अनुष्ठान क्षेत्र',
        medical: 'चिकित्सा एवं प्राथमिक उपचार केंद्र',
        water: 'पेयजल केंद्र',
        waitingHalls: 'प्रतीक्षा कक्ष',
        other: 'अन्य नागरिक सुविधाएं',
      },
      noResults: 'आपकी खोज से मेल खाती कोई सुविधा नहीं मिली।',
      viewOnMap: 'मानचित्र पर देखें',
      getDirections: 'मार्ग देखें',
    },
    statuses: {
      illustrative_sample: 'प्रतीकात्मक नमूना (Sample)',
      historical_reference: 'ऐतिहासिक संदर्भ',
      pending_verification: 'सत्यापन लंबित',
      officially_verified: 'आधिकारिक तौर पर सत्यापित',
    },
    emergency: {
      title: 'आपातकालीन सहायता की रिपोर्ट करें',
      subtext: 'कार्यक्रम नियंत्रण कक्ष से तुरंत संपर्क करें',
      directCallNotice: 'अति आवश्यक: जीवन रक्षा हेतु सीधे आपातकालीन नंबरों पर कॉल करें:',
      call112: '112 डायल करें (पुलिस / सभी आपात स्थिति)',
      call108: '108 डायल करें (एम्बुलेंस / चिकित्सा)',
      formNotice: 'यह फॉर्म सबमिट करने से कंट्रोल रूम को अलर्ट जाएगा। यह सीधे कॉल का विकल्प नहीं है।',
      categoryLabel: 'आपातकालीन श्रेणी',
      descriptionLabel: 'स्थिति का विवरण',
      contactLabel: 'आपका मोबाइल नंबर',
      submitButton: 'आपातकालीन अलर्ट भेजें',
      sosModalTitle: 'आपातकालीन SOS एवं तत्काल सहायता',
      sosModalSubtitle: 'सीधे आपातकालीन हेल्पलाइन और नजदीकी सहायता केंद्र',
      officialHotlinesTitle: 'आधिकारिक आपातकालीन हेल्पलाइन (तुरंत कॉल करें)',
      call112Desc: 'राष्ट्रीय आपातकालीन सेवा (पुलिस, अग्निशमन, आपदा) — टोल फ्री',
      call108Desc: 'निःशुल्क एम्बुलेंस एवं चिकित्सा सहायता — 24/7 टोल फ्री',
      controlRoomDesc: 'पुष्करालु नदी तट नियंत्रण कक्ष एवं कमान डेस्क',
      nearestAidTitle: 'निकटतम ऑन-ग्राउंड सहायता केंद्र (स्वतः खोजी गई)',
      nearestMedicalTitle: 'निकटतम प्राथमिक चिकित्सा एवं मेडिकल बूथ',
      nearestPoliceTitle: 'निकटतम पुलिस चौकी / सहायता डेस्क',
      walkDirectionsButton: 'सहायता केंद्र तक पैदल मार्ग',
      distanceAway: 'की दूरी पर',
      estimatedWalkTime: 'अनुमानित पैदल समय',
      walkDisclaimer: 'अनुमानित पैदल समय (1.15 मी/सेकंड की गति पर) — यह आधिकारिक प्रतिक्रिया समय की गारंटी नहीं है।',
      locationStatusLive: 'लाइव जीपीएस सक्रिय',
      locationStatusUnavailable: 'जीपीएस स्थान अनुपलब्ध',
      detectGpsButton: 'मेरा जीपीएस स्थान खोजें',
      selectManualLandmark: 'या निकटतम लैंडमार्क / घाट चुनें:',
      manualLandmarkNotice: 'चयनित लैंडमार्क के आधार पर गणना',
      reportToControlRoomButton: 'कंट्रोल रूम को ऑनलाइन रिपोर्ट भेजें',
      emergencyAudioMutedNotice: 'आपातकालीन अलर्ट सक्रिय हुआ। ऑडियो गाइड म्यूट कर दिया गया है।',
      closeButton: 'बंद करें',
    },
    missingPerson: {
      title: 'लापता व्यक्ति की रिपोर्ट दर्ज करें',
      subtext: 'पुष्करालु लॉस्ट एंड फाउंड कंट्रोल सेल को विवरण भेजें',
      nameLabel: 'लापता व्यक्ति का नाम',
      ageLabel: 'आयु / अनुमानित आयु',
      lastSeenLabel: 'अंतिम बार देखा गया स्थान / घाट',
      contactLabel: 'रिपोर्टर का मोबाइल नंबर',
      submitButton: 'रिपोर्ट सबमिट करें',
      privacyNotice: 'दर्ज की गई जानकारी गोपनीय रखी जाती है और केवल अधिकृत अधिकारियों द्वारा जांची जाती है।',
    },
    foundPerson: {
      title: 'मिले हुए व्यक्ति की सूचना दें',
      subtext: 'अकेले मिले बच्चे या वयस्क की जानकारी दें',
      descriptionLabel: 'शारीरिक विवरण / कपड़े / पहचान',
      locationLabel: 'वर्तमान सुरक्षित स्थान / सहायता डेस्क',
      contactLabel: 'खोजकर्ता का मोबाइल नंबर',
      submitButton: 'विवरण सबमिट करें',
    },
    dosDonts: {
      title: 'श्रद्धालुओं हेतु सुरक्षा दिशानिर्देश — क्या करें और क्या न करें',
      subtext: 'गोदावरी पुष्करालु में सुरक्षित रहने हेतु महत्वपूर्ण निर्देश',
      dosTitle: 'क्या करें (Do’s)',
      dontsTitle: 'क्या न करें (Don’ts)',
      citation: 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDMA) एवं आंध्र प्रदेश राज्य आपदा प्रबंधन के दिशानिर्देशों पर आधारित।',
    },
    gps: {
      locateMe: 'मेरा उपकरण स्थान खोजें',
      locating: 'जीपीएस द्वारा स्थान खोजा जा रहा है...',
      liveLocation: 'लाइव डिवाइस जीपीएस',
      permissionDenied: 'स्थान अनुमति अस्वीकृत कर दी गई। आप मैन्युअल रूप से प्रारंभिक गेट या स्थल चुन सकते हैं।',
      unavailable: 'जीपीएस स्थान अनुपलब्ध है। कृपया अनुमति जांचें या प्रारंभिक स्थल चुनें।',
      timeout: 'स्थान अनुरोध समय समाप्त हुआ। कृपया पुनः प्रयास करें।',
      unsupported: 'यह ब्राउज़र जियोलोकेशन का समर्थन नहीं करता है।',
      accuracyLabel: 'सटीकता',
      meters: 'मी.',
      selectManualStart: 'प्रारंभिक स्थल चुनें',
      manualStartNotice: 'मैन्युअल प्रारंभिक स्थल चयनित',
      httpsRequirementNotice: 'सूचना: उत्पादन में डिवाइस जियोलोकेशन के लिए HTTPS आवश्यक है (परीक्षण हेतु localhost मान्य है)।',
    },
    navigation: {
      directions: 'पैदल मार्ग देखें',
      routeToFacility: 'इस सुविधा हेतु मार्ग',
      startNavigation: 'पैदल मार्गदर्शन शुरू करें',
      stopNavigation: 'नेविगेशन समाप्त करें',
      arrivedTitle: 'आप गंतव्य पर पहुंच गए हैं!',
      arrivedDesc: 'आप इस सुविधा के समीप पहुंच चुके हैं।',
      origin: 'प्रारंभिक स्थल',
      destination: 'गंतव्य स्थल',
      distance: 'कुल दूरी',
      estimatedTime: 'अनुमानित पैदल समय',
      minutes: 'मिनट',
      stepByStep: 'चरणबद्ध पैदल दिशा-निर्देश',
      pedestrianNetworkNotice: 'पुष्करालु तट पैदल मार्ग ग्रिड पर आधारित मार्ग। पुलिस बैरिकेड लेआउट के अनुसार परिवर्तन संभव।',
      approximateNotice: 'प्रत्यक्ष पैदल संपर्क (सत्यापन प्रक्रियाधीन)।',
      selectOriginTitle: 'अपना प्रारंभिक स्थल चुनें',
      useMyGps: 'मेरे वर्तमान डिवाइस जीपीएस का उपयोग करें',
      orChooseLandmark: 'या कोई प्रवेश द्वार / स्थल चुनें:',
      outsideGeofenceNotice: 'आप वर्तमान में मेला मैदान से बाहर हैं',
      outsideGeofenceDesc: 'पैदल मार्ग केंद्रीय मुख्य द्वार 02 (पुष्कर मेहराब) से शुरू हो रहा है।',
      changeGateBtn: 'गेट बदलें',
      offRouteNotice: 'मार्ग से हटे • नया तेज़ मार्ग खोजा जा रहा है...',
      recenter: 'पुनः केंद्रित करें',
      routeOverview: 'मार्ग का अवलोकन',
      walkingSpeedNote: 'पैदल चाल 1.2 मी./से',
      eta: 'ईटीए',
    },
    qr: {
      scanQrBtn: 'क्यूआर कोड स्कैन करें',
      viewQrBtn: 'सुविधा क्यूआर देखें',
      scannerTitle: 'पुष्करालु सुविधा क्यूआर स्कैन करें',
      scannerSubtitle: 'स्टॉल, घाट या प्रवेश द्वारों पर लगे आधिकारिक क्यूआर कोड को स्कैन करें।',
      scannerHelp: 'क्यूआर स्कैन करने पर 3D मैप सीधे उस सुविधा पर केंद्रित होता है (यह आपके वास्तविक जीपीएस को नहीं बदलता)।',
      generatorTitle: 'आधिकारिक सुविधा क्यूआर साइनेज',
      generatorSubtitle: 'स्टॉल संचालकों और अधिकारियों हेतु मुद्रण-योग्य क्यूआर कोड।',
      downloadPng: 'क्यूआर डाउनलोड करें',
      printSign: 'आधिकारिक साइनेज प्रिंट करें',
      copyLink: 'लिंक कॉपी करें',
      copied: 'लिंक कॉपी हो गया!',
      invalidQrNotice: 'अज्ञात क्यूआर कोड संदर्भ। मुख्य मानचित्र पर वापस ले जाया गया।',
      cameraErrorNotice: 'कैमरा अनुपलब्ध है। आप स्टॉल आईडी मैन्युअल रूप से दर्ज कर सकते हैं।',
      enterCodeManual: 'स्टॉल / सुविधा आईडी मैन्युअल दर्ज करें:',
    },
  },
};
