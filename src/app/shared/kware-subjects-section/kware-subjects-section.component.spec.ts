import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwareSubjectsSectionComponent } from './kware-subjects-section.component';

describe('KwareSubjectsSectionComponent', () => {
  let component: KwareSubjectsSectionComponent;
  let fixture: ComponentFixture<KwareSubjectsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KwareSubjectsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KwareSubjectsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
