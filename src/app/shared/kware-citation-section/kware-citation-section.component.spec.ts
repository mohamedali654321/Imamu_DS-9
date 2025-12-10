import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwareCitationSectionComponent } from './kware-citation-section.component';

describe('KwareCitationSectionComponent', () => {
  let component: KwareCitationSectionComponent;
  let fixture: ComponentFixture<KwareCitationSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KwareCitationSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KwareCitationSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
