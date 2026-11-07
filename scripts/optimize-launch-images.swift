import Foundation
import ImageIO
import UniformTypeIdentifiers

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
func resize(_ input: String, to output: String, width: Int, quality: Double) throws {
    let source = CGImageSourceCreateWithURL(root.appendingPathComponent(input) as CFURL, nil)!
    let image = CGImageSourceCreateThumbnailAtIndex(source, 0, [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: width,
    ] as CFDictionary)!
    let url = root.appendingPathComponent(output)
    let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.jpeg.identifier as CFString, 1, nil)!
    CGImageDestinationAddImage(destination, image, [kCGImageDestinationLossyCompressionQuality: quality] as CFDictionary)
    precondition(CGImageDestinationFinalize(destination))
    print("\(output): \(try Data(contentsOf: url).count) bytes")
}
try resize("assets/avatar-nick-small.png", to: "assets/avatar-nick-96.jpg", width: 96, quality: 0.72)
try resize("assets/fuse-media/fuse-plus-membership.png", to: "assets/fuse-media/fuse-plus-membership-800.jpg", width: 800, quality: 0.7)
try resize("assets/fuse-media/fuse-plus-membership.png", to: "assets/fuse-media/fuse-plus-membership-1200.jpg", width: 1200, quality: 0.7)
let avatar = try Data(contentsOf: root.appendingPathComponent("assets/avatar-nick-96.jpg")).base64EncodedString()
let favicon = """
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <defs><clipPath id="circle"><circle cx="16" cy="16" r="16"/></clipPath></defs>
  <image width="32" height="32" clip-path="url(#circle)" href="data:image/jpeg;base64,\(avatar)"/>
</svg>
"""
try favicon.write(to: root.appendingPathComponent("public/favicon.svg"), atomically: true, encoding: .utf8)
