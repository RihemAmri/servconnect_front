/*import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';*/
import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-gestionbook',
  imports: [CommonModule],
  templateUrl: './gestionbook.component.html',
  styleUrl: './gestionbook.component.scss'
})
export class GestionbookComponent {

  constructor(private mapService: MapService) {}

async ngAfterViewInit() {
  //await this.mapService.initMap('map');

  // ⏳ attendre que la map soit réellement construite
  await new Promise(res => setTimeout(res, 300));

  this.mapService.enableClickListener(async (lat, lon) => {
    console.log("📍 Position cliquée :", lat, lon);

    await this.mapService.placeMarker(lat, lon);

    const address = await this.mapService.reverseGeocode(lat, lon);
    console.log("🏠 Adresse cliquée :", address?.display_name);
  });
}



   locate() {
  this.mapService.locateUser().then(async pos => {
    await this.mapService.placeMarker(pos.lat, pos.lon);
    this.mapService.setView(pos.lat, pos.lon, 15); // ✅ Appel correct
    const address = await this.mapService.reverseGeocode(pos.lat, pos.lon);
    console.log("Adresse trouvée :", address?.display_name);
  });
}

  async search(query: string) {
  const result = await this.mapService.searchAndMark(query);

  if (result) {
    console.log("📌 Résultat trouvé :", result);
    console.log("Lat:", result.y, "Lon:", result.x);
    console.log("Adresse:", result.label);
  } else {
    console.log("❌ Aucun résultat");
  }
}

}
