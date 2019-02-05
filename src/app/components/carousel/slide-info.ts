export class SlideInfo {

  public icon: string;
  public title: string;
  public isSelected: boolean;

  constructor(icon: string, title: string, isSelected: boolean) {
    this.icon = icon;
    this.title = title;
    this.isSelected = isSelected;
  }
}
