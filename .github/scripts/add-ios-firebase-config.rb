#!/usr/bin/env ruby
# Adds GoogleService-Info.plist to the App target resources at CI time.
# The plist itself is restored from a GitHub secret and is never committed.

require 'xcodeproj'

project_path = ARGV[0] || 'ios/App/App.xcodeproj'
plist_name = 'GoogleService-Info.plist'

project = Xcodeproj::Project.open(project_path)
target = project.targets.find { |item| item.name == 'App' }
abort 'App target not found' unless target

app_group = project.main_group.groups.find { |group| group.display_name == 'App' }
abort 'App group not found' unless app_group

file_ref = app_group.files.find { |file| File.basename(file.path.to_s) == plist_name }
file_ref ||= app_group.new_file(plist_name)

unless target.resources_build_phase.files_references.include?(file_ref)
  target.resources_build_phase.add_file_reference(file_ref, true)
end

project.save
puts "#{plist_name} added to App resources"
