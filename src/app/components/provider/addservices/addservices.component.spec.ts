import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddservicesComponent } from './addservices.component';

describe('AddservicesComponent', () => {
  let component: AddservicesComponent;
  let fixture: ComponentFixture<AddservicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddservicesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddservicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
