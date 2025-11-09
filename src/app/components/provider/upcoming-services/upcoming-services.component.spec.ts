import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingServicesComponent } from './upcoming-services.component';

describe('UpcomingServicesComponent', () => {
  let component: UpcomingServicesComponent;
  let fixture: ComponentFixture<UpcomingServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpcomingServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpcomingServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
