import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionbookComponent } from './gestionbook.component';

describe('GestionbookComponent', () => {
  let component: GestionbookComponent;
  let fixture: ComponentFixture<GestionbookComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionbookComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionbookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
