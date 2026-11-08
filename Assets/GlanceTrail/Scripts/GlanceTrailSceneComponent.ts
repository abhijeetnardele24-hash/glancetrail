/** GlanceTrail — native SPECS spatial rehearsal scene. */
import {Interactable} from "SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable"
import {GlanceTrailController, InteractionDeduplicator, type ITimerService} from "./GlanceTrailController"
import {GlanceTrailUI, type UIRenderSnapshot} from "./GlanceTrailUI"
import {GlanceTrailAudio} from "../Audio/GlanceTrailAudio"
import {RehearsalMode, RehearsalState} from "./GlanceTrailTypes"

type TrailNode = {object: SceneObject; text: Text; interactable?: Interactable}

class LensStudioTimerService implements ITimerService {
  private activeEvents: DelayedCallbackEvent[] = []
  constructor(private host: BaseScriptComponent) {}
  schedule(ms: number, callback: () => void): DelayedCallbackEvent {
    const delayed = this.host.createEvent("DelayedCallbackEvent")
    delayed.bind(() => {
      this.activeEvents = this.activeEvents.filter((event) => event !== delayed)
      callback()
    })
    delayed.reset(ms / 1000)
    this.activeEvents.push(delayed)
    return delayed
  }
  cancel(handle: DelayedCallbackEvent): void {
    if (!handle) return
    handle.enabled = false
    this.activeEvents = this.activeEvents.filter((event) => event !== handle)
  }
}

@component
export class GlanceTrailSceneComponent extends BaseScriptComponent {
  private readonly ink = new vec4(1, 0.965, 0.89, 1)
  private readonly secondaryInk = new vec4(0.76, 0.83, 0.78, 1)
  private readonly teal = new vec4(0.13, 0.92, 0.76, 1)
  private readonly amber = new vec4(1, 0.70, 0.30, 1)
  private readonly glass = new vec4(0.055, 0.115, 0.105, 0.88)
  private readonly glassStrong = new vec4(0.075, 0.17, 0.145, 0.94)

  private controller!: GlanceTrailController
  private ui!: GlanceTrailUI
  private camera: Camera | null = null
  private stage!: SceneObject
  private welcome!: TrailNode
  private beginButton!: TrailNode
  private beatNodes: TrailNode[] = []
  private ribbon!: TrailNode
  private continueButton!: TrailNode
  private rescueButton!: TrailNode
  private trail!: TrailNode
  private completion!: TrailNode
  private direction!: TrailNode
  private status!: TrailNode
  private pulseTime = 0
  private lastGuidanceState = false
  private readonly inputDeduplicator = new InteractionDeduplicator(120)

  onAwake(): void {
    this.camera = this.findCamera()
    this.controller = new GlanceTrailController(new LensStudioTimerService(this))
    this.ui = new GlanceTrailUI(this.controller, new GlanceTrailAudio())
    this.buildStage()
    this.controller.addListener(() => this.render(this.ui.getSnapshot()))
    this.render(this.ui.getSnapshot())
    this.createEvent("UpdateEvent").bind((event: UpdateEvent) => this.updateFrame(event.getDeltaTime()))
    print("[GlanceTrail] READY — native SPECS scene, SIK targets, two-pass rehearsal")
  }

  private buildStage(): void {
    this.stage = global.scene.createSceneObject("GlanceTrail · Spatial Stage")
    // Capture the wearer's initial pose, then leave the stage in world space.
    // This works in every Preview environment while preserving a stable room
    // anchor when the wearer subsequently turns their head.
    if (this.camera) {
      const cameraTransform = this.camera.getSceneObject().getTransform()
      const cameraRotation = cameraTransform.getWorldRotation()
      const forward = cameraRotation.multiplyVec3(new vec3(0, 0, -1))
      this.stage.getTransform().setWorldPosition(cameraTransform.getWorldPosition().add(forward.uniformScale(110)))
      this.stage.getTransform().setWorldRotation(cameraRotation)
    } else {
      this.stage.getTransform().setWorldPosition(new vec3(0, 0, -110))
    }
    // Text layout coordinates are authored in UIKit units; this calibrated
    // scale maps the 63-unit card to roughly a 60–70 cm apparent width at 1.1 m.
    this.stage.getTransform().setLocalScale(new vec3(9, 9, 9))
    this.status = this.createNode("Status · GlanceTrail", "GLANCETRAIL   •   SPATIAL REHEARSAL", new vec3(0, 28, 0), 58, 5, 2.15, this.secondaryInk, new vec4(0, 0, 0, 0))
    this.welcome = this.createNode("Welcome Card", "EYES UP.  FIND YOUR WORDS.\n\nTurn this room into a three-stop memory path for your next pitch.", new vec3(0, 9, 0), 58, 27, 4.1, this.ink, this.glassStrong)
    this.beginButton = this.createButton("Begin Rehearsal", "BEGIN REHEARSAL   →", new vec3(0, -10, -0.5), 28, 8, () => this.ui.onBeginRehearsalClicked())

    const beatNames = ["①  PROBLEM", "②  PROOF", "③  ASK"]
    // Keep every target inside the 26° comfort arc. The previous ±26-unit
    // centres put the outer labels against the SPECS preview crop.
    const x = [-20, 0, 20]
    for (let i = 0; i < beatNames.length; i++) {
      const index = i
      this.beatNodes.push(this.createButton(`Beacon ${i + 1} · ${beatNames[i]}`, beatNames[i], new vec3(x[i], 11, 0), 18, 10, () => {
        if (this.controller.getCurrentBeatIndex() === index) this.ui.onActiveCueClicked()
      }, this.glass))
    }

    this.ribbon = this.createButton("Cue Ribbon · Detail on demand", "", new vec3(0, -2, -0.5), 58, 22, () => this.ui.onActiveCueClicked(), this.glassStrong, 3.35)
    this.continueButton = this.createButton("Continue", "CONTINUE   →", new vec3(12, -19, -1), 24, 8, () => this.ui.onContinueClicked())
    this.rescueButton = this.createButton("Need a hint", "NEED A HINT?", new vec3(-14, -19, -1), 24, 8, () => this.ui.onRescueHintClicked(), new vec4(0.16, 0.12, 0.055, 0.92))
    this.trail = this.createNode("Connected Memory Trail", "●  ─────────  ●  ─────────  ●", new vec3(0, 19, 0.5), 58, 6, 3.5, this.teal, new vec4(0, 0, 0, 0))
    this.completion = this.createNode("Completion Card", "PATH CONNECTED\n\nYou kept your eyes up and carried the story across the room.", new vec3(0, 3, -0.5), 58, 25, 4, this.ink, this.glassStrong)
    this.direction = this.createNode("Directional Recovery", "", new vec3(0, 24, -2), 33, 7, 2.8, this.amber, new vec4(0.18, 0.09, 0.025, 0.94))
  }

  private createButton(name: string, label: string, position: vec3, width: number, height: number, action: () => void, background = new vec4(0.07, 0.31, 0.255, 0.96), textSize = 2.7): TrailNode {
    const node = this.createNode(name, label, position, width, height, textSize, this.ink, background)
    const collider = node.object.createComponent("Physics.ColliderComponent")
    const shape = Shape.createBoxShape()
    shape.size = new vec3(width, height, 2.5)
    collider.shape = shape
    const interactable = node.object.createComponent(Interactable.getTypeName()) as Interactable
    interactable.colliders = [collider]
    const invoke = (source: string) => {
      if (!this.inputDeduplicator.accept(name, getTime() * 1000)) return
      print(`[GlanceTrail] input ${source} -> ${name}`)
      action()
      this.render(this.ui.getSnapshot())
    }
    interactable.onTriggerStart.add(() => invoke("SIK trigger"))

    // Native tap fallback keeps Interactive Preview fully clickable while the
    // SIK Interactable remains the primary hand/pinch path on SPECS.
    const previewTap = node.object.createComponent("Component.InteractionComponent")
    if (this.camera) previewTap.setCamera(this.camera)
    previewTap.addMeshVisual(node.text)
    previewTap.setMinimumTouchSize(0.08)
    previewTap.onTap.add(() => invoke("native tap"))
    node.interactable = interactable
    return node
  }

  private createNode(name: string, value: string, position: vec3, width: number, height: number, size: number, color: vec4, background: vec4): TrailNode {
    const object = global.scene.createSceneObject(name)
    object.setParent(this.stage)
    // Counter-scale authored offsets so calibration enlarges panels without
    // pushing their layout centers outside the 26° comfortable arc.
    object.getTransform().setLocalPosition(position.uniformScale(1 / 9))
    const text = object.createComponent("Component.Text")
    text.text = value
    text.size = size * 2.1
    text.weight = 560
    text.horizontalAlignment = HorizontalAlignment.Center
    text.verticalAlignment = VerticalAlignment.Center
    text.horizontalOverflow = HorizontalOverflow.Wrap
    text.verticalOverflow = VerticalOverflow.Shrink
    text.layoutRect = Rect.create(-width / 2, width / 2, -height / 2, height / 2)
    text.textFill.color = color
    text.backgroundSettings.enabled = background.w > 0
    text.backgroundSettings.fill.color = background
    text.backgroundSettings.cornerRadius = 0.42
    text.backgroundSettings.margins = Rect.create(1.4, 1.4, 0.9, 0.9)
    text.outlineSettings.enabled = true
    text.outlineSettings.fill.color = new vec4(color.x, color.y, color.z, 0.14)
    text.outlineSettings.size = 0.12
    text.depthTest = true
    return {object, text}
  }

  private render(snapshot: UIRenderSnapshot): void {
    this.welcome.object.enabled = snapshot.welcomeVisible
    this.beginButton.object.enabled = snapshot.welcomeVisible
    this.status.text.text = snapshot.welcomeVisible
      ? "GLANCETRAIL   •   SPATIAL REHEARSAL"
      : snapshot.state === RehearsalState.FINAL_COMPLETE
        ? "REHEARSAL COMPLETE   •   PATH CONNECTED"
        : snapshot.state === RehearsalState.GUIDED_COMPLETE
          ? "GUIDED PATH   •   CONNECTED"
          : snapshot.mode === RehearsalMode.SYMBOL_ONLY
            ? "FINAL RUN   •   SYMBOLS ONLY"
            : "GUIDED RUN   •   DETAIL ON DEMAND"
    for (let i = 0; i < this.beatNodes.length; i++) {
      const node = this.beatNodes[i]
      node.object.enabled = snapshot.beaconsVisible
      const active = snapshot.activeBeatIndex === i
      node.text.textFill.color = active ? this.ink : this.secondaryInk
      node.text.backgroundSettings.fill.color = active ? this.glassStrong : this.glass
    }
    this.ribbon.object.enabled = snapshot.cueRibbonVisible
    if (snapshot.cueRibbonText) {
      const cue = snapshot.cueRibbonText
      const modeLabel = snapshot.mode === RehearsalMode.SYMBOL_ONLY ? "MEMORY MARK" : "SPEAKING CUE"
      const primary = cue.shortCue.length > 0 ? cue.shortCue : cue.symbolMark
      const detail = cue.showDetail && cue.detailText.length > 0 ? `\n\n${cue.detailText}` : ""
      this.ribbon.text.text = `${modeLabel}   •   ${cue.symbolMark}\n\n${primary}${detail}`
    }
    this.continueButton.object.enabled = snapshot.continueButtonVisible || snapshot.completionVisible
    this.continueButton.text.text = snapshot.continueButtonLabel.toUpperCase() + "   →"
    // Completion has only one action, so center it. During rehearsal the
    // right-hand placement leaves room for the rescue target.
    this.continueButton.object.getTransform().setLocalPosition(
      new vec3(snapshot.completionVisible ? 0 : 12, -19, -1).uniformScale(1 / 9)
    )
    this.rescueButton.object.enabled = snapshot.rescueHintVisible
    this.trail.object.enabled = snapshot.trailConnectedVisible
    this.completion.object.enabled = snapshot.completionVisible
    this.completion.text.text = snapshot.state === RehearsalState.FINAL_COMPLETE ? "REHEARSAL COMPLETE\n\nThe path is yours now. Take the room with you." : "PATH CONNECTED\n\nNow run it again with only the three memory marks."
    this.direction.object.enabled = snapshot.directionalArrowVisible
    this.direction.text.text = snapshot.directionalArrowSide === "left" ? "←  TURN LEFT" : "TURN RIGHT  →"
  }

  private updateFrame(deltaTime: number): void {
    this.pulseTime += deltaTime
    const activeIndex = this.controller.getCurrentBeatIndex()
    for (let i = 0; i < this.beatNodes.length; i++) {
      const pulse = i === activeIndex ? 1 + Math.sin(this.pulseTime * 3.2) * 0.045 : 1
      this.beatNodes[i].object.getTransform().setLocalScale(new vec3(pulse, pulse, pulse))
    }
    if (!this.camera || activeIndex < 0 || !this.beatNodes[activeIndex].object.enabled) return
    const cameraTransform = this.camera.getSceneObject().getTransform()
    const cameraPosition = cameraTransform.getWorldPosition()
    const targetPosition = this.beatNodes[activeIndex].object.getTransform().getWorldPosition()
    const forward = cameraTransform.getWorldRotation().multiplyVec3(new vec3(0, 0, -1))
    const flatForward = new vec3(forward.x, 0, forward.z).normalize()
    const targetDirection = targetPosition.sub(cameraPosition)
    const flatTarget = new vec3(targetDirection.x, 0, targetDirection.z).normalize()
    const angle = flatForward.angleTo(flatTarget) * 180 / Math.PI
    const side = flatForward.cross(flatTarget).y > 0 ? "left" : "right"
    const outside = angle > GlanceTrailController.FOV_HALF_ANGLE_DEG
    const signedAngle = outside ? (side === "left" ? -angle : angle) : 0
    const chime = this.controller.updateCameraYaw(signedAngle)
    if (chime && !this.lastGuidanceState) print("[GlanceTrail] spatial recovery chime")
    this.lastGuidanceState = outside
    this.render(this.ui.getSnapshot())
  }

  private findCamera(): Camera | null {
    for (let i = 0; i < global.scene.getRootObjectsCount(); i++) {
      const found = this.findCameraRecursive(global.scene.getRootObject(i))
      if (found) return found
    }
    return null
  }

  private findCameraRecursive(object: SceneObject): Camera | null {
    const camera = object.getComponent("Component.Camera")
    if (camera) return camera
    for (let i = 0; i < object.getChildrenCount(); i++) {
      const found = this.findCameraRecursive(object.getChild(i))
      if (found) return found
    }
    return null
  }
}
