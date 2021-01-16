import React, { useState, useRef, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import '../styles/Map.css';
import useSupercluster from 'use-supercluster';
import { useTranslation } from 'react-i18next';
import fb from '../firebase';
import Entry from './entry/Entry';
import NotifyMe from './NotifyMe';

import userIsOnMobile from '../util/userIsOnMobile';
import parseDoc from '../util/parseDoc';

const DEFAULT_ZOOM_LEVEL = userIsOnMobile() ? 5 : 6;

const Marker = ({ children }) => children;

export default function EntryMap() {
  const mapRef = useRef();

  const { t } = useTranslation();

  const [zoom, setZoom] = useState(DEFAULT_ZOOM_LEVEL);
  const [bounds, setBounds] = useState(null);

  const [selectedHelpRequests, setSelectedHelpRequests] = useState([]);

  const [lastSelectedMarkerId, setLastSelectedMarkerId] = useState();
  const [
    lastSelectedMarkerLocation,
    setLastSelectedMarkerLocation,
  ] = useState();

  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const threeMonthAgo = new Date();
      threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
      const queryResult = await fb.store.collection('ask-for-help').orderBy('d.timestamp').startAt(threeMonthAgo.getTime()).get();

      const entriesFromQuery = queryResult.docs
        .map(parseDoc)
        .filter(Boolean) // filter entries that we weren't able to parse and are therefore null
        .map((dataPoint) => ({
          type: 'Feature',
          properties: {
            ...dataPoint,
            cluster: false,
          },
          geometry: {
            type: 'Point',
            coordinates: [
              parseFloat(dataPoint.coordinates.longitude),
              parseFloat(dataPoint.coordinates.latitude),
            ],
          },
        }));

      setEntries(entriesFromQuery);
    };

    fetchEntries();
  }, []);

  const { clusters, supercluster } = useSupercluster({
    points: entries,
    bounds,
    zoom,
    options: { radius: 75, maxZoom: 23 },
  });

  return (
    <div>
      <NotifyMe location={lastSelectedMarkerLocation} />
      <p className="font-open-sans font-hairline text-s italic mb-3">
        {t('components.map.hint')}
      </p>
      <div className="my-3" style={{ height: '600px', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{
            language: 'de',
            region: 'de',
            key: process.env.REACT_GOOGLE_MAPS_KEY,
          }}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map }) => {
            mapRef.current = map;
          }}
          defaultCenter={{
            lat: 51.1888907,
            lng: 9.5866037,
          }}
          defaultZoom={DEFAULT_ZOOM_LEVEL}
          onChange={({ zoom: zoomValue, bounds: boundsValue }) => {
            setZoom(zoomValue);
            setBounds([
              boundsValue.nw.lng,
              boundsValue.se.lat,
              boundsValue.se.lng,
              boundsValue.nw.lat,
            ]);
          }}
        >
          {clusters.map((cluster) => {
            const [longitude, latitude] = cluster.geometry.coordinates;
            const {
              cluster: isCluster,
              point_count: pointCount,
            } = cluster.properties;

            if (isCluster) {
              return (
                <Marker
                  key={`cluster-${cluster.id}`}
                  lat={latitude}
                  lng={longitude}
                >
                  <button
                    type="button"
                    className={`cluster-marker focus:outline-none ${
                      lastSelectedMarkerId === cluster.id ? 'cm-selected' : ''
                    }`}
                    style={{
                      width: `${22 + (pointCount / entries.length) * 100}px`,
                      height: `${22 + (pointCount / entries.length) * 100}px`,
                    }}
                    onClick={() => {
                      setLastSelectedMarkerId(cluster.id);
                      const leaves = supercluster.getLeaves(
                        cluster.id,
                        Infinity,
                      );
                      setSelectedHelpRequests(
                        leaves.map((leaf) => leaf.properties),
                      );

                      // if all leaves have the same location, display it below map
                      // if not, reset it to undefined to show fallback text
                      const leafLocations = leaves.map(
                        (leaf) => leaf.properties.location,
                      );
                      const uniqueLeafLocations = leafLocations.filter(
                        (value, index, self) => self.indexOf(value) === index,
                      );

                      if (uniqueLeafLocations.length === 1) {
                        setLastSelectedMarkerLocation(uniqueLeafLocations[0]);
                      } else {
                        setLastSelectedMarkerLocation(undefined);
                      }
                    }}
                  >
                    <p className="font-open-sans">{pointCount}</p>
                  </button>
                </Marker>
              );
            }

            return (
              <Marker
                key={`helpRequest-${cluster.properties.id}`}
                lat={latitude}
                lng={longitude}
              >
                <button
                  type="button"
                  className={`help-request-marker focus:outline-none flex ${
                    lastSelectedMarkerId === cluster.properties.id
                      ? 'hrm-selected'
                      : ''
                  }`}
                  style={{
                    width: `${22 + (pointCount / entries.length) * 100}px`,
                    height: `${22 + (pointCount / entries.length) * 100}px`,
                  }}
                  onClick={() => {
                    setLastSelectedMarkerId(cluster.properties.id);
                    setLastSelectedMarkerLocation(cluster.properties.location);
                    setSelectedHelpRequests([cluster.properties]);
                  }}
                >
                  <img
                    className="help-request-image"
                    alt="help-marker"
                    src={require('../assets/help_white.svg').default}
                  />
                </button>
              </Marker>
            );
          })}
        </GoogleMapReact>
      </div>
      <strong className="font-open-sans">
        {lastSelectedMarkerLocation
          ? t('components.map.requestsInSelectedLocation', {
            count: selectedHelpRequests.length,
            region: lastSelectedMarkerLocation,
          })
          : t('components.map.requestsInSelectedLocationFallback', {
            count: selectedHelpRequests.length,
          })}
      </strong>
      {selectedHelpRequests.length === 0 ? (
        <p className="font-open-sans">
          {t('components.map.selectALocationFirst')}
        </p>
      ) : (
        selectedHelpRequests.map((entry) => (
          <Entry
            key={entry.id}
            location={entry.location}
            id={entry.id}
            request={entry.request}
            timestamp={entry.timestamp}
            responses={entry.responses}
            reportedBy={entry.reportedBy}
            uid={entry.uid}
          />
        ))
      )}
    </div>
  );
}
