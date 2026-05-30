import React, { useEffect, useRef, useState } from 'react';

const Map3D = ({ river, view3d = true, layers = { terrain: true, imagery: 'satellite' } }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [cesiumReady, setCesiumReady] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);

  // Check if Cesium global is loaded
  useEffect(() => {
    const checkCesium = setInterval(() => {
      if (window.Cesium) {
        clearInterval(checkCesium);
        setCesiumReady(true);
      }
    }, 100);

    return () => clearInterval(checkCesium);
  }, []);

  // Initialize Cesium Viewer
  useEffect(() => {
    if (!cesiumReady || !containerRef.current || viewerRef.current) return;

    const Cesium = window.Cesium;

    // Use default sandbox credentials
    Cesium.Ion.defaultAccessToken = '';

    try {
      const viewer = new Cesium.Viewer(containerRef.current, {
        imageryProvider: new Cesium.UrlTemplateImageryProvider({
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          credit: '© OpenStreetMap contributors, © CartoDB'
        }),
        terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Start with safe ellipsoid provider
        animation: false,
        baseLayerPicker: false,
        fullscreenButton: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        infoBox: true,
        sceneModePicker: true,
        selectionIndicator: true,
        timeline: false,
        navigationHelpButton: false,
        navigationInstructionsInitiallyVisible: false,
        scene3DOnly: false
      });

      // Enable depth testing so lines drape nicely on terrain
      viewer.scene.globe.depthTestAgainstTerrain = true;
      
      // Custom dark styled background for space skybox
      viewer.scene.skyAtmosphere.show = true;
      viewer.scene.fog.enabled = true;
      viewer.scene.fog.density = 0.0002;
      viewer.scene.fog.screenSpaceErrorFactor = 2.0;

      viewerRef.current = viewer;
    } catch (error) {
      console.error('Error initializing Cesium Viewer:', error);
    }

    return () => {
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [cesiumReady]);

  // Toggle between 2D (Google Map view) and 3D (Google Earth view)
  useEffect(() => {
    if (!viewerRef.current || !cesiumReady) return;
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    try {
      if (view3d) {
        viewer.scene.morphTo3D(1.0); // smooth 1-second transition to 3D Earth
      } else {
        viewer.scene.morphTo2D(1.0); // smooth 1-second transition to 2D Map
      }
    } catch (err) {
      console.error('Error morphing map view:', err);
    }
  }, [view3d, cesiumReady]);

  // Handle River Changes and KML Loads
  useEffect(() => {
    if (!viewerRef.current || !cesiumReady) return;

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    // Clear existing datasources (old paths) and entities
    viewer.dataSources.removeAll();
    viewer.entities.removeAll();

    if (!river) {
      // If no river selected, fly to a general view of Bangladesh
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(90.3563, 23.6850, 600000.0), // Bangladesh center
        duration: 2.0
      });
      return;
    }

    const { name, lat, lng, zoom_level, kml_path } = river;
    setLoadingMap(true);

    if (kml_path) {
      // We have an uploaded KML file! Load it dynamically (properly URL encoded for spaces)
      const kmlUrl = encodeURI(`${window.location.origin}${kml_path}`);
      console.log('Loading KML map layer from:', kmlUrl);

      Cesium.KmlDataSource.load(kmlUrl, {
        camera: viewer.camera,
        canvas: viewer.canvas,
        clampToGround: true // Drapes lines perfectly over the 3D hills and terrain
      })
      .then((dataSource) => {
        viewer.dataSources.add(dataSource);
        
        // Custom styling for river lines if they are parsed
        const entities = dataSource.entities.values;
        entities.forEach(entity => {
          if (entity.polyline) {
            entity.polyline.width = 5;
            entity.polyline.material = new Cesium.ColorMaterialProperty(
              Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.9)
            );
          }
        });

        // Beautiful zoom and fly transition into the river's KML boundaries
        viewer.zoomTo(dataSource);
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
        setLoadingMap(false);
      })
      .catch((err) => {
        console.error('Error loading KML layer, falling back to coordinate pin:', err);
        // Fallback: Add coordinate marker and fly there
        drawCoordinateMarker(name, lat, lng);
        flyToCoords(lat, lng, zoom_level);
        setLoadingMap(false);
      });
    } else {
      // No KML file path seeded yet, draw an elegant glowing telemetry station marker and fly there
      drawCoordinateMarker(name, lat, lng);
      flyToCoords(lat, lng, zoom_level);
      setLoadingMap(false);
    }
  }, [river, cesiumReady]);

  // Draw an elegant glowing pin & label at coordinates
  const drawCoordinateMarker = (name, lat, lng) => {
    if (!viewerRef.current) return;
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lng, lat),
      point: {
        pixelSize: 14,
        color: Cesium.Color.fromCssColorString('#38bdf8'),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 3,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      label: {
        text: name,
        font: 'bold 13px Sora, sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 4,
        outlineColor: Cesium.Color.fromCssColorString('#060e20'),
        fillColor: Cesium.Color.WHITE,
        pixelOffset: new Cesium.Cartesian2(0, -25),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    });
  };

  // Dynamic Terrain & Layer adjustments
  useEffect(() => {
    if (!viewerRef.current || !cesiumReady) return;

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    try {
      // Toggle terrain safely without crashing if Ion is not authenticated
      if (layers.terrain) {
        viewer.terrainProvider = Cesium.createWorldTerrain ? Cesium.createWorldTerrain() : new Cesium.EllipsoidTerrainProvider();
      } else {
        viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
      }
    } catch (err) {
      console.warn('Cesium terrain load failed, falling back to ellipsoid:', err);
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
  }, [layers.terrain, cesiumReady]);

  // Handle Imagery Layer Changes
  useEffect(() => {
    if (!viewerRef.current || !cesiumReady) return;
    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    try {
      // Clear existing imagery layers
      viewer.imageryLayers.removeAll();

      let provider;
      if (layers.imagery === 'satellite') {
        provider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          credit: 'Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
        });
      } else {
        provider = new Cesium.UrlTemplateImageryProvider({
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
          credit: '© OpenStreetMap contributors, © CartoDB'
        });
      }

      viewer.imageryLayers.addImageryProvider(provider);
    } catch (err) {
      console.error('Error changing imagery layer:', err);
    }
  }, [layers.imagery, cesiumReady]);

  const flyToCoords = (lat, lng, zoom) => {
    if (!viewerRef.current) return;
    const Cesium = window.Cesium;
    
    // Map zoom level to Cartesian height
    const height = Math.max(1000, 1000000 / Math.pow(2, (zoom || 8) - 6));
    
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(0.0),
        pitch: Cesium.Math.toRadians(-35.0), // Tilt camera slightly for 3D depth perception
        roll: 0.0
      },
      duration: 3.0
    });
  };

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#060e20]">
      {/* Loading Cover */}
      {(!cesiumReady || loadingMap) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
          <span className="font-data-mono text-data-mono text-primary text-xs uppercase tracking-widest animate-pulse">
            {!cesiumReady ? 'Booting Volumetric 3D Engine...' : 'Acquiring River Telemetry...'}
          </span>
        </div>
      )}

      {/* Cesium canvas target mount */}
      <div ref={containerRef} className="w-full h-full" style={{ minHeight: '400px' }} />
    </div>
  );
};

export default Map3D;
