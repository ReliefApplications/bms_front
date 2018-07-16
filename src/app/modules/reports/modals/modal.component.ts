import { Component, Input, OnInit } from '@angular/core';
import { IndicatorService } from '../services/indicator.service';
import { CacheService } from '../../../core/storage/cache.service';

@Component({
  selector: 'modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})


export class ModalComponent implements OnInit {


  @Input() modalId: string;
  @Input() modalTitle: string;

  constructor(
    public referedClassService: IndicatorService,
    public cacheService: CacheService) {
  }

  ngOnInit() {
  }
}
