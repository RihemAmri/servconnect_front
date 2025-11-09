import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastServicesComponent } from './past-services.component';

describe('PastServicesComponent', () => {
  let component: PastServicesComponent;
  let fixture: ComponentFixture<PastServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastServicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PastServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
