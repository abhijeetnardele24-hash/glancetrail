/**
 * GlanceTrail - Audio Feedback Manager
 * 
 * Provides spatial chimes for beat transitions, path completion,
 * rescue hint triggers, and out-of-view excursion guidance.
 * Gracefully falls back to silent operation if audio hardware is unavailable.
 */

export class GlanceTrailAudio {
  private isMuted: boolean = false;
  private audioComponent: any = null;

  constructor(audioComponent?: any) {
    this.audioComponent = audioComponent || null;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playBeatAdvance(beatIndex: number): void {
    if (this.isMuted) return;
    // Frequencies: Problem = 440 Hz (A4), Proof = 554.37 Hz (C#5), Ask = 659.25 Hz (E5)
    this.logOrPlay(`BeatAdvance_${beatIndex}`);
  }

  public playTrailConnected(): void {
    if (this.isMuted) return;
    // Chord resolve: A major triad shimmer
    this.logOrPlay("TrailConnected_Chord");
  }

  public playExcursionChime(): void {
    if (this.isMuted) return;
    // Soft spatial guidance ping (high register, subtle)
    this.logOrPlay("DirectionalGuidance_Chime");
  }

  public playRescueHintChime(): void {
    if (this.isMuted) return;
    this.logOrPlay("RescueHint_Tone");
  }

  public playResetChime(): void {
    if (this.isMuted) return;
    this.logOrPlay("Reset_SoftFaint");
  }

  private logOrPlay(soundName: string): void {
    if (this.audioComponent && typeof this.audioComponent.play === "function") {
      try {
        this.audioComponent.play(soundName);
      } catch (err) {
        // Fallback safely
      }
    }
  }
}
