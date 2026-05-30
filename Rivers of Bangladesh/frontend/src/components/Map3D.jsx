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
        terrainProvider: layers.terrain ? Cesium.createWorldTerrain() : undefined,
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
        scene3DOnly: true
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

  // Handle River Changes and KML Loads
  useEffect(() => {
    if (!viewerRef.current || !cesiumReady) return;

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    // Clear existing datasources (old paths)
    viewer.dataSources.removeAll();

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
      // We have an uploaded KML file! Load it dynamically
      const kmlUrl = `${window.location.origin}${kml_path}`;
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
            entity.polyline.width = 4;
            entity.polyline.material = new Cesium.ColorMaterialProperty(
              Cesium.Color.fromCssString('#98cbff').withAlpha(0.8)
            );
          }
        });

        // Beautiful zoom and fly transition into the river's KML boundaries
        viewer.zoomTo(dataSource).then(() => {
          // Adjust camera tilt for an immersive 3D effect!
          viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
          setLoadingMap(false);
        });
      })
      .catch((err) => {
        console.error('Error loading KML layer:', err);
        // Fallback: Fly to lat/lng coordinates if KML fails to load
        flyToCoords(lat, lng, zoom_level);
        setLoadingMap(false);
      });
    } else {
      // No KML file path seeded yet, draw a placeholder coordinates marker and fly there
      flyToCoords(lat, lng, zoom_level);
      setLoadingMap(false);
    }
  }, [river, cesiumReady]);

  // Dynamic Terrain & Layer adjustments
  useEffect(() => {
    if (!viewerRef.current || !cesiumReady) return;

    const Cesium = window.Cesium;
    const viewer = viewerRef.current;

    // Toggle terrain
    if (layers.terrain) {
      viewer.terrainProvider = Cesium.createWorldTerrain();
    } else {
      viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
    }
  }, [layers.terrain, cesiumReady]);

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
