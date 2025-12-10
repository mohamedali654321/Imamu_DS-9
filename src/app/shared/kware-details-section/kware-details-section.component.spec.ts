import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwareDetailsSectionComponent } from './kware-details-section.component';

describe('KwareDetailsSectionComponent', () => {
  let component: KwareDetailsSectionComponent;
  let fixture: ComponentFixture<KwareDetailsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KwareDetailsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KwareDetailsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
