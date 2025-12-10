import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwareLisenceSectionComponent } from './kware-lisence-section.component';

describe('KwareLisenceSectionComponent', () => {
  let component: KwareLisenceSectionComponent;
  let fixture: ComponentFixture<KwareLisenceSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KwareLisenceSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KwareLisenceSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
