import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResubmitDocsComponent } from './resubmit-docs.component';

describe('ResubmitDocsComponent', () => {
  let component: ResubmitDocsComponent;
  let fixture: ComponentFixture<ResubmitDocsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResubmitDocsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResubmitDocsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
