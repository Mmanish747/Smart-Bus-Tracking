// LocationPicker.tsx
"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { LocateFixed, X } from "lucide-react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:"https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type Location={lat:number;lng:number};

export interface LocationPickerProps{
  open:boolean;
  initialLocation?:Location;
  onClose:()=>void;
  onConfirm:(location:Location)=>void;
}

const DEFAULT={lat:27.7172,lng:85.324};

function MapUpdater({location}:{location:Location}){
  const map=useMap();
  useEffect(()=>{map.flyTo(location,16,{animate:true,duration:1});},[location,map]);
  return null;
}

function ClickHandler({onPick}:{onPick:(l:Location)=>void}){
  useMapEvents({
    click(e){onPick({lat:e.latlng.lat,lng:e.latlng.lng});}
  });
  return null;
}

export default function LocationPicker({
  open,onClose,onConfirm,initialLocation
}:LocationPickerProps){
  const [location,setLocation]=useState<Location>(initialLocation??DEFAULT);
  const [address,setAddress]=useState("");
  const [search,setSearch]=useState("");
  const [results,setResults]=useState<any[]>([]);

  useEffect(()=>{if(initialLocation)setLocation(initialLocation)},[initialLocation]);

  useEffect(()=>{
    const run=async()=>{
      try{
        const r=await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`);
        const j=await r.json();
        setAddress(j.display_name||"");
      }catch{}
    };
    run();
  },[location]);

  async function searchPlace(q:string){
    setSearch(q);
    if(!q){setResults([]);return;}
    const r=await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`);
    setResults(await r.json());
  }

  function current(){
    navigator.geolocation.getCurrentPosition(p=>{
      setLocation({lat:p.coords.latitude,lng:p.coords.longitude});
    });
  }

  if(!open) return null;

  return <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="font-bold text-xl">Select Location</h2>
        <button onClick={onClose}><X/></button>
      </div>

      <div className="relative border-b p-4">
        <input value={search} onChange={e=>searchPlace(e.target.value)}
        className="w-full rounded-xl border px-4 py-3"
        placeholder="Search place..."/>
        {results.length>0 && <div className="absolute left-4 right-4 top-16 bg-white border rounded-xl shadow max-h-60 overflow-auto z-[10000]">
          {results.map(r=><button key={r.place_id} className="block w-full text-left p-3 hover:bg-gray-100"
          onClick={()=>{
            setLocation({lat:+r.lat,lng:+r.lon});
            setSearch(r.display_name);
            setResults([]);
          }}>{r.display_name}</button>)}
        </div>}
      </div>

      <div className="flex-1">
        <MapContainer center={location} zoom={15} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
          <MapUpdater location={location}/>
          <ClickHandler onPick={setLocation}/>
          <Marker draggable position={location}
            eventHandlers={{dragend:e=>{
              const p=(e.target as any).getLatLng();
              setLocation({lat:p.lat,lng:p.lng});
            }}}/>
        </MapContainer>
      </div>

      <div className="border-t p-4 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="font-semibold">Address</p>
          <p className="text-sm text-gray-600">{address||"Loading..."}</p>
          <p className="mt-2"><b>Latitude:</b> {location.lat.toFixed(6)}</p>
          <p><b>Longitude:</b> {location.lng.toFixed(6)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button onClick={current} className="px-4 py-2 border rounded-lg flex gap-2 items-center"><LocateFixed size={18}/>Current</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={()=>onConfirm(location)} className="px-4 py-2 rounded-lg bg-green-600 text-white">Confirm</button>
        </div>
      </div>
    </div>
  </div>
}
