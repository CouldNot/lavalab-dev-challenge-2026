"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import styles from "./dashboard.module.css";

const marker = L.divIcon({ className: styles.mapMarker, html: "<span></span>", iconSize: [34, 34], iconAnchor: [17, 17] });

function Recenter({ latitude, longitude }: { latitude: number; longitude: number }) {
  const map = useMap();
  useEffect(() => { map.setView([latitude, longitude], 14); }, [latitude, longitude, map]);
  return null;
}

export default function MapPanel({ latitude, longitude, fieldName, expanded = false }: { latitude: number; longitude: number; fieldName: string; expanded?: boolean }) {
  return (
    <MapContainer center={[latitude, longitude]} zoom={14} scrollWheelZoom={expanded} zoomControl={expanded} attributionControl={expanded} className={styles.leafletMap}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]} icon={marker}><Popup>{fieldName}</Popup></Marker>
      <Recenter latitude={latitude} longitude={longitude} />
    </MapContainer>
  );
}
