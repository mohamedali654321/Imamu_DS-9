import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseBySchoolComponent } from './browse-by-school.component';

describe('BrowseBySchoolComponent', () => {
  let component: BrowseBySchoolComponent;
  let fixture: ComponentFixture<BrowseBySchoolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrowseBySchoolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrowseBySchoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
