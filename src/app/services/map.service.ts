import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  private L: any = null;
  private GeoProvider: any = null;

  private map: any;
  private marker: any;

  private isBrowser = typeof window !== 'undefined';

  constructor() {}

  // -------------------------------
  // 1) Chargement dynamique Leaflet
  // -------------------------------
  async loadLeaflet() {
    if (!this.isBrowser) return null;

    if (!this.L) {
      const module = await import('leaflet');
      this.L = module;
    }

    return this.L;
  }

  // -----------------------------------------
  // 2) Chargement dynamique leaflet-geosearch
  // -----------------------------------------
  async loadGeoSearch() {
    if (!this.isBrowser) return null;

    if (!this.GeoProvider) {
      const module: any = await import('leaflet-geosearch');
      this.GeoProvider = new module.OpenStreetMapProvider();
    }

    return this.GeoProvider;
  }

  // -------------------------------
  // Initialisation map
  // -------------------------------
  /*async initMap(elementId: string) {
    if (!this.isBrowser) return;

    const L = await this.loadLeaflet();
    if (!L) return;

    setTimeout(() => {
      const container = document.getElementById(elementId);
      if (!container) return;

      this.map = L.map(elementId).setView([36.8065, 10.1815], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(this.map);
    }, 100);
  }
  */
  // -------------------------------
  // Marker
  // -------------------------------
  async placeMarker(lat: number, lon: number) {
    const L = await this.loadLeaflet();
    if (!L || !this.map) return;

    if (this.marker) this.map.removeLayer(this.marker);

    this.marker = L.marker([lat, lon]).addTo(this.map);
  }

  // -------------------------------
  // Géolocalisation navigateur
  // -------------------------------
  async locateUser() {
    if (!this.isBrowser) return null;

    return new Promise<any>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(pos => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        });
      }, reject);
    });
  }

  // -------------------------------
  // Recherche d’adresse
  // -------------------------------
  async search(query: string) {
    const provider = await this.loadGeoSearch();
    if (!provider || !query) return [];

    return provider.search({ query });
  }

  async searchAndMark(query: string) {
    const results = await this.search(query);
    if (!results.length) return null;

    const r = results[0];

    await this.placeMarker(r.y, r.x);
    this.map.setView([r.y, r.x], 15);

    return r;
  }
 async reverseGeocode(lat: number, lon: number) {
  const url = `http://localhost:5000/api/map/reverse?lat=${lat}&lon=${lon}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur backend reverse geocode");
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

public setView(lat: number, lon: number, zoom: number = 15) {
  if (!this.map) return;
  this.map.setView([lat, lon], zoom);
}

async enableClickListener(onClick: (lat: number, lon: number) => void) {
  const L = await this.loadLeaflet();
  if (!L || !this.map) return;

  this.map.on('click', (e: any) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    console.log("👇 Clic détecté :", lat, lon);

    onClick(lat, lon);
  });
}

setMap(mapInstance: L.Map) {
  this.map = mapInstance;
}
}
