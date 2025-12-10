import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KwareMetricDonutsComponent } from './kware-metric-donuts.component';

describe('KwareMetricDonutsComponent', () => {
  let component: KwareMetricDonutsComponent;
  let fixture: ComponentFixture<KwareMetricDonutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KwareMetricDonutsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KwareMetricDonutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
