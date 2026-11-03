import React, { useState, useMemo, useEffect, useRef } from 'react';



import { Language, MainSection, Facility, UserLocation, GeolocationStatus, NavigationRoute } from './types';



import { Header } from './components/Header';



import { ServicePanel } from './components/ServicePanel';



import { Interactive3DMap } from './components/map/Interactive3DMap';



import { MissingPersonView } from './components/views/MissingPersonView';



import { FoundPersonView } from './components/views/FoundPersonView';



import { EmergencyView } from './components/views/EmergencyView';



import { DosDontsView } from './components/views/DosDontsView';



import { NavigationPanel } from './components/navigation/NavigationPanel';



import { ManualOriginModal } from './components/navigation/ManualOriginModal';



import { QRCodeModal } from './components/qr/QRCodeModal';



import { QRScannerModal } from './components/qr/QRScannerModal';



import { CrowdReportModal } from './components/crowd/CrowdReportModal';



import { FloatingSosButton } from './components/map/FloatingSosButton';



import { EmergencySosModal } from './components/map/EmergencySosModal';



import { CrowdHeatmapLegend } from './components/crowd/CrowdHeatmapLegend';



import { MobileBottomNav } from './components/navigation/MobileBottomNav';



import { MobileDashboard } from './components/home/MobileDashboard';



import { MobilePlacesView } from './components/places/MobilePlacesView';



import { dispatchEmergencyAlertEvent } from './services/emergencyProximity';



import {



  CrowdSimulationPreset,



  getCrowdDensityZones,



  getCrowdNodeFactors,



  subscribeToCrowdUpdates,



  setSimulationPreset,



} from './services/crowdDensityService';



import { FACILITIES_DATA } from './data/facilitiesData';



import {



  requestCurrentDevicePosition,



  watchDevicePosition,



  clearDevicePositionWatch,



  isWithinEventGeofence,



  getDistanceFromEventCenterMeters,



  DEFAULT_EVENT_ORIGIN,



} from './services/geolocationService';



import {



  calculatePedestrianRoute,



  isUserNearDestination,



  detectOffRouteDeviation,



} from './services/routingService';



import { Menu, X } from 'lucide-react';







export const App: React.FC = () => {



  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');



  const [currentSection, setCurrentSection] = useState<MainSection>('places');



  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState<boolean>(false);



  const [isMobileHomeActive, setIsMobileHomeActive] = useState<boolean>(() => {



    if (typeof window !== 'undefined') {



      const params = new URLSearchParams(window.location.search);



      if (params.get('facility') || params.get('dest')) return false;



      return window.innerWidth < 768;



    }



    return false;



  });







  // Map & Directory Shared State



  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(() => {



    if (typeof window !== 'undefined') {



      const params = new URLSearchParams(window.location.search);



      const targetId = params.get('facility') || params.get('dest');



      if (targetId) {



        return FACILITIES_DATA.find((f) => f.id === targetId) || null;



      }



    }



    return null;



  });



  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');



  const [searchQuery, setSearchQuery] = useState<string>('');







  // --- PHASE 4: GPS GEOLOCATION STATE ---



  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);



  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>('idle');



  const [gpsErrorMessage, setGpsErrorMessage] = useState<string | undefined>(undefined);



  const [isManualOriginModalOpen, setIsManualOriginModalOpen] = useState<boolean>(false);



  const [isOutsideGeofence, setIsOutsideGeofence] = useState<boolean>(false);



  const [offsiteDistanceKm, setOffsiteDistanceKm] = useState<number | null>(null);



  const pendingDestinationRef = useRef<Facility | null>(null);







  // --- PHASE 4: NAVIGATION & ROUTING STATE ---



  const [activeRoute, setActiveRoute] = useState<NavigationRoute | null>(null);



  const [routeOverviewTrigger, setRouteOverviewTrigger] = useState<number>(0);



  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);



  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(true);



  const [isOffRoute, setIsOffRoute] = useState<boolean>(false);



  const [offRouteDistance, setOffRouteDistance] = useState<number>(0);



  const handleRouteOverview = () => {



    setIsFollowingUser(false);



    setRouteOverviewTrigger((k) => k + 1);



  };







  const handleRecenterOnUser = () => {



    setIsFollowingUser(true);



    setRecenterTrigger((prev) => prev + 1);



  };







  const handleRecalculateRoute = () => {



    if (!activeRoute || !userLocation) return;



    const routingOptions = getActiveRoutingOptions(isEmergencyActiveRef.current);



    const newRoute = calculatePedestrianRoute(userLocation, activeRoute.destination, routingOptions);



    setActiveRoute(newRoute);



    setIsOffRoute(false);



    setOffRouteDistance(0);



  };







  // --- PHASE 4: QR CODE SYSTEM STATE ---



  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);



  const [isQrGeneratorOpen, setIsQrGeneratorOpen] = useState<boolean>(false);



  const [qrTargetFacility, setQrTargetFacility] = useState<Facility | null>(null);







  // --- PHASE 5: CROWD REPORTING STATE ---



  const [isCrowdModalOpen, setIsCrowdModalOpen] = useState<boolean>(false);







  // --- PHASE 4.1: EMERGENCY SOS & NEAREST AID STATE ---



  const [isEmergencySosModalOpen, setIsEmergencySosModalOpen] = useState<boolean>(false);







  // --- PHASE 4.2: DYNAMIC CROWD HEATMAP & CONGESTION-AWARE ROUTING STATE ---



  const [showCrowdHeatmap, setShowCrowdHeatmap] = useState<boolean>(true);



  const [avoidCrowds, setAvoidCrowds] = useState<boolean>(true);



  const [crowdPreset, setCrowdPreset] = useState<CrowdSimulationPreset>('peak_snanam_rush');



  const isEmergencyActiveRef = useRef<boolean>(false);







  // Subscribe to crowd data simulation events



  useEffect(() => {



    const unsub = subscribeToCrowdUpdates((preset) => {



      setCrowdPreset(preset);



    });



    return unsub;



  }, []);







  // Helper to generate current routing options



  const getActiveRoutingOptions = (emergencyOverride?: boolean) => {



    const isEmerg = emergencyOverride !== undefined ? emergencyOverride : isEmergencyActiveRef.current;



    const crowdFactors = getCrowdNodeFactors(crowdPreset);



    return {



      avoidCrowds,



      crowdFactors,



      isEmergencyPriority: isEmerg,



    };



  };







  // Dynamically recalculate route whenever crowd settings change



  useEffect(() => {



    if (activeRoute && userLocation) {



      const options = getActiveRoutingOptions();



      const updatedRoute = calculatePedestrianRoute(userLocation, activeRoute.destination, options);



      setActiveRoute(updatedRoute);



    }



  }, [avoidCrowds, crowdPreset]);







  // Filter facilities based on category and search



  const filteredFacilities = useMemo(() => {



    return FACILITIES_DATA.filter((f) => {



      const matchesCategory =



        activeCategoryFilter === 'all' || f.category === activeCategoryFilter;



      const q = searchQuery.toLowerCase().trim();



      const matchesSearch =



        !q ||



        f.id.toLowerCase().includes(q) ||



        f.name.en.toLowerCase().includes(q) ||



        f.name.te.toLowerCase().includes(q) ||



        f.name.hi.toLowerCase().includes(q) ||



        f.description.en.toLowerCase().includes(q);







      return matchesCategory && matchesSearch;



    });



  }, [activeCategoryFilter, searchQuery]);







  // Request device GPS position with 2,500m Event Geofence Guard



  const handleRequestLocation = async () => {



    setGeolocationStatus('requesting');



    setGpsErrorMessage(undefined);







    const res = await requestCurrentDevicePosition();



    if (res.status === 'active' && res.location) {



      const deviceCoord: [number, number] = [res.location.lat, res.location.lng];



      const isInside = isWithinEventGeofence(deviceCoord);







      if (isInside) {



        // On-site pilgrim within 2,500m event perimeter: use live GPS



        setUserLocation(res.location);



        setGeolocationStatus('active');



        setIsOutsideGeofence(false);



        setOffsiteDistanceKm(null);







        const target = pendingDestinationRef.current || activeRoute?.destination;



        if (target) {



          const options = getActiveRoutingOptions(isEmergencyActiveRef.current);



          const route = calculatePedestrianRoute(res.location, target, options);



          setActiveRoute(route);



          pendingDestinationRef.current = null;



        }



      } else {



        // Remote visitor (> 2,500m away, e.g. 157 km):



        // Guard against remote pedestrian routes by defaulting to Central Main Gate 02



        const distMeters = getDistanceFromEventCenterMeters(deviceCoord);



        const distKm = Math.round(distMeters / 1000);



        setIsOutsideGeofence(true);



        setOffsiteDistanceKm(distKm);



        setGeolocationStatus('active');



        setUserLocation(DEFAULT_EVENT_ORIGIN);







        const target = pendingDestinationRef.current || activeRoute?.destination;



        if (target) {



          const options = getActiveRoutingOptions(isEmergencyActiveRef.current);



          const route = calculatePedestrianRoute(DEFAULT_EVENT_ORIGIN, target, options);



          setActiveRoute(route);



          pendingDestinationRef.current = null;



        }



      }



    } else {



      setGeolocationStatus(res.status);



      setGpsErrorMessage(res.errorMessage);



      // Fallback: Default to Central Main Gate 02 so navigation is never blocked



      setUserLocation(DEFAULT_EVENT_ORIGIN);



      setIsOutsideGeofence(false);



      setOffsiteDistanceKm(null);



      const target = pendingDestinationRef.current || activeRoute?.destination;



      if (target) {



        const options = getActiveRoutingOptions(isEmergencyActiveRef.current);



        const route = calculatePedestrianRoute(DEFAULT_EVENT_ORIGIN, target, options);



        setActiveRoute(route);



        pendingDestinationRef.current = null;



      }



    }



  };







  // Start route to a destination facility



  const handleStartRoute = (destination: Facility, options?: { isEmergencyPriority?: boolean }) => {



    setSelectedFacility(destination);



    const isEmerg = !!options?.isEmergencyPriority;



    isEmergencyActiveRef.current = isEmerg;



    const routingOptions = getActiveRoutingOptions(isEmerg);







    if (userLocation) {



      const route = calculatePedestrianRoute(userLocation, destination, routingOptions);



      setActiveRoute(route);



    } else {



      pendingDestinationRef.current = destination;



      handleRequestLocation();



    }



  };







  // Manual origin selected



  const handleSelectManualOrigin = (loc: UserLocation) => {



    setUserLocation(loc);



    setIsOutsideGeofence(false);



    setOffsiteDistanceKm(null);



    setGeolocationStatus('idle'); // Manual starting point







    const targetDest = pendingDestinationRef.current || activeRoute?.destination || selectedFacility;



    if (targetDest) {



      const routingOptions = getActiveRoutingOptions(isEmergencyActiveRef.current);



      const route = calculatePedestrianRoute(loc, targetDest, routingOptions);



      setActiveRoute(route);



      pendingDestinationRef.current = null;



    }



  };







  // Watch position during live GPS navigation



  useEffect(() => {



    if (!activeRoute) return;







    const watchId = watchDevicePosition(



      (newLoc) => {



        if (isWithinEventGeofence([newLoc.lat, newLoc.lng])) {



          setUserLocation(newLoc);



          setIsOutsideGeofence(false);



          setOffsiteDistanceKm(null);







          // 1. Check arrival (within 15m)



          const arrived = isUserNearDestination(



            [newLoc.lat, newLoc.lng],



            activeRoute.destination.coordinates,



            15



          );







          if (arrived) {



            if (!activeRoute.isArrived) {



              setActiveRoute((prev) => (prev ? { ...prev, isArrived: true } : null));



            }



            setIsOffRoute(false);



            setOffRouteDistance(0);



            return;



          }







          // 2. Check route deviation (threshold 25m)



          const deviation = detectOffRouteDeviation(



            [newLoc.lat, newLoc.lng],



            activeRoute.pathCoordinates,



            25



          );







          if (deviation.isOffRoute) {



            console.log(



              `Live GPS deviated ${deviation.distanceToRouteMeters}m. Auto-recalculating route...`



            );



            setIsOffRoute(true);



            setOffRouteDistance(deviation.distanceToRouteMeters);



            const routingOptions = getActiveRoutingOptions(isEmergencyActiveRef.current);



            const newRoute = calculatePedestrianRoute(newLoc, activeRoute.destination, routingOptions);



            setActiveRoute(newRoute);



            setIsOffRoute(false);



            setOffRouteDistance(0);



          } else {



            setIsOffRoute(false);



            setOffRouteDistance(0);



          }



        } else {



          setIsOutsideGeofence(true);



          const distKm = Math.round(



            getDistanceFromEventCenterMeters([newLoc.lat, newLoc.lng]) / 1000



          );



          setOffsiteDistanceKm(distKm);



        }



      },



      (_status, err) => {



        console.warn('GPS continuous watch notice:', err);



      }



    );







    return () => {



      if (watchId !== null) clearDevicePositionWatch(watchId);



    };



  }, [activeRoute]);







  // Test & Simulation helper to verify movement, progress, and off-route recalculation



  useEffect(() => {



    (window as any).__getUserLocation = () => userLocation;



    (window as any).__getActiveRoute = () => activeRoute;



  }, [userLocation, activeRoute]);



  useEffect(() => {



    (window as any).__updatePilgrimLocation = (



      lat: number,



      lng: number,



      source: 'live_gps' | 'manual_selection' = 'live_gps'



    ) => {



      const newLoc: UserLocation = {



        lat,



        lng,



        accuracy: 8,



        heading: null,



        speed: 1.2,



        timestamp: Date.now(),



        source,



        label: source === 'live_gps' ? 'Live Device GPS' : 'Manual Location',



      };



      setUserLocation(newLoc);







      if (activeRoute) {



        if (isUserNearDestination([lat, lng], activeRoute.destination.coordinates, 15)) {



          setActiveRoute((prev) => (prev ? { ...prev, isArrived: true } : null));



          setIsOffRoute(false);



          setOffRouteDistance(0);



          return;



        }







        const deviation = detectOffRouteDeviation([lat, lng], activeRoute.pathCoordinates, 25);



        if (deviation.isOffRoute) {



          console.log(



            `Location deviated ${deviation.distanceToRouteMeters}m from route. Recalculating...`



          );



          setIsOffRoute(true);



          setOffRouteDistance(deviation.distanceToRouteMeters);



          const routingOptions = getActiveRoutingOptions(isEmergencyActiveRef.current);



          const newRoute = calculatePedestrianRoute(newLoc, activeRoute.destination, routingOptions);



          setActiveRoute(newRoute);



          setIsOffRoute(false);



          setOffRouteDistance(0);



        } else {



          setIsOffRoute(false);



          setOffRouteDistance(0);



        }



      }



    };



  }, [activeRoute]);







  // Open QR Generator Modal



  const handleViewQrCode = (facility: Facility) => {



    setQrTargetFacility(facility);



    setIsQrGeneratorOpen(true);



  };







  // Facility found from QR Scanner



  const handleQrFacilityFound = (facility: Facility) => {



    setSelectedFacility(facility);



    // Safe deep-link update without page reload



    if (typeof window !== 'undefined' && window.history) {



      const newUrl = `${window.location.pathname}?facility=${encodeURIComponent(facility.id)}`;



      window.history.pushState({ path: newUrl }, '', newUrl);



    }



  };







  const handleSelectSection = (section: MainSection) => {



    setCurrentSection(section);



    setIsMobilePanelOpen(false);



  };







  const handleBackToMap = () => {



    setCurrentSection('places');



  };







  return (



    <div className="flex flex-col h-screen h-[100dvh] w-screen bg-slate-100 overflow-hidden font-sans select-none">



      {/* Full Width Top Header (Left 65% Title | Right 35% Language Selector) */}



      <Header



        currentLanguage={currentLanguage}



        onLanguageChange={setCurrentLanguage}



        onOpenHome={() => {



          setIsMobileHomeActive(true);



          setIsMobilePanelOpen(false);



        }}



        isMobileHome={isMobileHomeActive}



        onOpenEmergencySos={() => {



          dispatchEmergencyAlertEvent({ trigger: 'header_sos_pill_click' });



          setIsEmergencySosModalOpen(true);



        }}



      />







      {/* Main Content Area */}



      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">



        {/* Mobile Visitor Home Dashboard (mobile only) */}



        {isMobileHomeActive && (



          <div className="md:hidden w-full h-full absolute inset-0 z-20">



            <MobileDashboard



              currentLanguage={currentLanguage}



              onLanguageChange={setCurrentLanguage}



              searchQuery={searchQuery}



              onSearchChange={setSearchQuery}



              onSearchSubmit={(q) => {



                setSearchQuery(q);



                setIsMobileHomeActive(false);



                setCurrentSection('places');



                setIsMobilePanelOpen(true);



              }}



              onOpenMap={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('places');



                setIsMobilePanelOpen(false);



              }}



              onOpenPlaces={(cat) => {



                setIsMobileHomeActive(false);



                setCurrentSection('places');



                if (cat) setActiveCategoryFilter(cat);



                setIsMobilePanelOpen(true);



              }}



              onOpenMedicalHelp={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('places');



                setActiveCategoryFilter('medical');



                setIsMobilePanelOpen(true);



              }}



              onOpenMissingPerson={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('report_missing');



              }}



              onOpenDosDonts={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('dos_donts');



              }}



              onOpenFoundPerson={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('found_missing');



              }}



              onOpenCrowdDensity={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('places');



                setIsMobilePanelOpen(false);



                setShowCrowdHeatmap(true);



              }}



              onOpenCrowdReport={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('places');



                setIsCrowdModalOpen(true);



              }}



              onOpenEmergencyView={() => {



                setIsMobileHomeActive(false);



                setCurrentSection('report_emergency');



              }}



              onTriggerSos={() => {



                dispatchEmergencyAlertEvent({ trigger: 'mobile_dashboard_sos_click' });



                setIsEmergencySosModalOpen(true);



              }}



              userLocation={userLocation}



              activeMissingCount={0}



            />



          </div>



        )}



        {/* Main View Area: 



            Desktop: 65% width when in map mode, OR 100% full-width view when dedicated reporting view is opened */}



        <main



          className={`h-full transition-all duration-200 overflow-hidden ${



            isMobileHomeActive ? 'hidden md:flex' : 'flex'



          } ${



            currentSection === 'places'



              ? 'w-full md:w-[65%] flex flex-col relative'



              : 'w-full flex-1 relative'



          }`}



        >



          {currentSection === 'places' && (



            <>



              <Interactive3DMap



                currentLanguage={currentLanguage}



                selectedFacility={selectedFacility}



                onSelectFacility={setSelectedFacility}



                activeCategoryFilter={activeCategoryFilter}



                onCategoryFilterChange={setActiveCategoryFilter}



                searchQuery={searchQuery}



                onSearchChange={setSearchQuery}



                userLocation={userLocation}



                geolocationStatus={geolocationStatus}



                onRequestLocation={handleRequestLocation}



                onOpenQrScanner={() => setIsQrScannerOpen(true)}



                activeRoute={activeRoute}



                routeOverviewTrigger={routeOverviewTrigger}



                recenterTrigger={recenterTrigger}



                isFollowingUser={isFollowingUser}



                onToggleFollowUser={setIsFollowingUser}



                onStartRoute={handleStartRoute}



                onViewQrCode={handleViewQrCode}



                onOpenCrowdReport={() => setIsCrowdModalOpen(true)}



                showCrowdHeatmap={showCrowdHeatmap}



                crowdZones={getCrowdDensityZones(crowdPreset)}



              />







              {/* Dynamic Crowd Heatmap & Congestion-Aware Legend (Inside 3D Map only) */}



              {!isMobileHomeActive && !isMobilePanelOpen && !activeRoute && (
                <CrowdHeatmapLegend



                  currentLanguage={currentLanguage}



                  showOverlay={showCrowdHeatmap}



                  onToggleOverlay={() => setShowCrowdHeatmap(!showCrowdHeatmap)}



                  avoidCrowds={avoidCrowds}



                  onToggleAvoidCrowds={() => setAvoidCrowds(!avoidCrowds)}



                  currentPreset={crowdPreset}



                  onPresetChange={(newPreset) => {



                    setCrowdPreset(newPreset);



                    setSimulationPreset(newPreset);



                  }}



                  activeRouteDetoured={!!(activeRoute as any)?.congestionAvoided}



                />



              )}







              {/* Active Pedestrian Navigation HUD */}



              {activeRoute && (



                <NavigationPanel



                  currentLanguage={currentLanguage}



                  route={activeRoute}



                  userLocation={userLocation}



                  onExitNavigation={() => {



                    setActiveRoute(null);



                    setIsOffRoute(false);



                    setOffRouteDistance(0);



                  }}



                  onChangeOrigin={() => setIsManualOriginModalOpen(true)}



                  isOutsideGeofence={isOutsideGeofence}



                  offsiteDistanceKm={offsiteDistanceKm}



                  onRouteOverview={handleRouteOverview}



                  onRecenterOnUser={handleRecenterOnUser}



                  isFollowingUser={isFollowingUser}



                  isOffRoute={isOffRoute}



                  offRouteDistanceMeters={offRouteDistance}



                  onRecalculateRoute={handleRecalculateRoute}



                />



              )}



            </>



          )}







          {currentSection === 'report_missing' && (



            <MissingPersonView



              currentLanguage={currentLanguage}



              onBackToMap={handleBackToMap}



            />



          )}







          {currentSection === 'found_missing' && (



            <FoundPersonView



              currentLanguage={currentLanguage}



              onBackToMap={handleBackToMap}



            />



          )}







          {currentSection === 'report_emergency' && (



            <EmergencyView



              currentLanguage={currentLanguage}



              onBackToMap={handleBackToMap}



            />



          )}







          {currentSection === 'dos_donts' && (



            <DosDontsView



              currentLanguage={currentLanguage}



              onBackToMap={handleBackToMap}



            />



          )}



        </main>







        {/* Right Service Panel:



            Desktop: 35% width beside map when Places is active.



            Mobile: Floating toggleable drawer */}



        {currentSection === 'places' && (



          <div className="hidden md:block md:w-[35%] h-full">



            <ServicePanel



              currentSection={currentSection}



              onSelectSection={handleSelectSection}



              currentLanguage={currentLanguage}



              facilities={filteredFacilities}



              selectedFacility={selectedFacility}



              onSelectFacility={setSelectedFacility}



              activeCategoryFilter={activeCategoryFilter}



              onCategoryFilterChange={setActiveCategoryFilter}



              onStartRoute={handleStartRoute}



              onViewQrCode={handleViewQrCode}



            />



          </div>



        )}







        {/* Mobile Navigation Toggle Button (visible only on mobile) */}



        {currentSection === 'places' && (



          <button



            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}



            className="hidden"



            aria-label="Toggle Places Directory"



          >



            {isMobilePanelOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}



          </button>



        )}







        {/* Mobile Places Directory View: Clean, category-first, visitor-friendly */}



        {isMobilePanelOpen && currentSection === 'places' && (



          <div className="md:hidden fixed inset-0 z-40 bg-slate-50 flex flex-col pb-14">



            <MobilePlacesView



              facilities={FACILITIES_DATA}



              selectedFacility={selectedFacility}



              onSelectFacility={(fac) => {



                setSelectedFacility(fac);



                setIsMobilePanelOpen(false);



              }}



              currentLanguage={currentLanguage}



              onLanguageChange={setCurrentLanguage}



              activeCategoryFilter={activeCategoryFilter}



              onCategoryFilterChange={setActiveCategoryFilter}



              searchQuery={searchQuery}



              onSearchChange={setSearchQuery}



              onStartRoute={(fac) => {



                setIsMobilePanelOpen(false);



                handleStartRoute(fac);



              }}



              onBackToHome={() => {



                setIsMobilePanelOpen(false);



                setIsMobileHomeActive(true);



              }}



              userLocation={userLocation}



            />



          </div>



        )}



      </div>







      {/* Mobile Fixed Bottom Navigation Bar (4 Tabs: Map, Places, Reports, Guidelines) */}



      {!activeRoute && (

        <MobileBottomNav



        currentSection={currentSection}



        currentLanguage={currentLanguage}



        isPlacesDrawerOpen={isMobilePanelOpen}



        isMobileHome={isMobileHomeActive}



        onOpenPlacesDrawer={() => {



          setIsMobileHomeActive(false);



          if (currentSection !== 'places') {



            setCurrentSection('places');



          }



          setIsMobilePanelOpen(true);



        }}



        onSelectSection={(section) => {



          setIsMobileHomeActive(false);



          setCurrentSection(section);



          setIsMobilePanelOpen(false);



        }}



        onOpenCrowdReport={() => {



          setIsMobileHomeActive(false);



          if (currentSection !== 'places') {



            setCurrentSection('places');



          }



          setIsMobilePanelOpen(false);



          setIsCrowdModalOpen(true);



        }}



      />

      )}







      {/* Manual Starting Point Modal */}



      {isManualOriginModalOpen && (



        <ManualOriginModal



          isOpen={isManualOriginModalOpen}



          onClose={() => setIsManualOriginModalOpen(false)}



          currentLanguage={currentLanguage}



          onSelectOrigin={handleSelectManualOrigin}



          onRequestGps={handleRequestLocation}



          gpsErrorMessage={gpsErrorMessage}



        />



      )}







      {/* QR Code Signage View/Print Modal */}



      {isQrGeneratorOpen && qrTargetFacility && (



        <QRCodeModal



          isOpen={isQrGeneratorOpen}



          onClose={() => setIsQrGeneratorOpen(false)}



          facility={qrTargetFacility}



          currentLanguage={currentLanguage}



        />



      )}







      {/* QR Scanner / Camera Modal */}



      {isQrScannerOpen && (



        <QRScannerModal



          isOpen={isQrScannerOpen}



          onClose={() => setIsQrScannerOpen(false)}



          onFacilityFound={handleQrFacilityFound}



          currentLanguage={currentLanguage}



        />



      )}







      {/* Crowd Density Report Modal */}



      {isCrowdModalOpen && (



        <CrowdReportModal



          currentLanguage={currentLanguage}



          userLocation={userLocation}



          onClose={() => setIsCrowdModalOpen(false)}



        />



      )}







      {/* PHASE 4.1: Persistent Floating SOS Emergency Button */}



      {currentSection === 'places' && (!isMobileHomeActive || (typeof window !== 'undefined' && window.innerWidth >= 768)) && !isMobilePanelOpen && (



        <FloatingSosButton



          currentLanguage={currentLanguage}



          onClick={() => {



            dispatchEmergencyAlertEvent({ trigger: 'floating_sos_button_click' });



            setIsEmergencySosModalOpen(true);



          }}



          isCardOpen={!!selectedFacility && !activeRoute}



        />



      )}







      {/* PHASE 4.1: Emergency SOS & Nearest Aid Assistance Modal */}



      <EmergencySosModal



        isOpen={isEmergencySosModalOpen}



        onClose={() => setIsEmergencySosModalOpen(false)}



        currentLanguage={currentLanguage}



        userLocation={userLocation}



        geolocationStatus={geolocationStatus}



        onRequestLocation={handleRequestLocation}



        facilities={FACILITIES_DATA}



        onStartRoute={(fac) => handleStartRoute(fac, { isEmergencyPriority: true })}



        onOpenReportEmergency={() => {



          setIsEmergencySosModalOpen(false);



          setCurrentSection('report_emergency');



        }}



      />



    </div>



  );



};



