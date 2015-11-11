%
% Generate textures for the top and body parts of three type of 
% waves (normal, big, none). The wave_frames variable specifies
% the number of frames (textures) to generate for a specific 
% wave type.
%

% Directory to save tiles in
target_directory = '../tiles/water/';

% Target size, larger images will be downscaled
target_size = [70 70];

% Size of tiles / images
tile_size = 4 * target_size;
image_size = [2 1] .* tile_size;

% Names of waves
wave_name = {'normal_waves2', 'big_waves2', 'no_waves2'};
wave_amplitude = [0.1 0.3 0.01];
wave_water_level = [0.4 0.5 0.2] - wave_amplitude;
wave_band_size = [35 35 35];
wave_frames = [6 3 7];

for i_wave = 1:3
    phases = linspace(1, 0, wave_frames(i_wave) + 1);
    
    for i_phase = 1:numel(phases)-1
        phase = phases(i_phase);
        
        A = waves(image_size, ...
                tile_size, ...
                phase, ...
                wave_water_level(i_wave), ...
                wave_amplitude(i_wave), ...
                wave_band_size(i_wave));

        ATop = A(1:280, :, :);
        ABody = A(281:end, :, :);

        ATop = imresize(ATop, target_size, 'bicubic', 'AntiAliasing', true);
        ABody = imresize(ABody, target_size, 'bicubic');

        if(numel(phases) - 1 == 1)
            filename_top = [wave_name{i_wave} '_top.png'];
            filename_body = [wave_name{i_wave} '_body.png'];
        else
            filename_top = [wave_name{i_wave} '_top_' num2str(i_phase) '.png'];
            filename_body = [wave_name{i_wave} '_body_' num2str(i_phase) '.png'];
        end
        
        fprintf('Writing %s and %s\n', filename_top, filename_body);
        
        imwrite(ATop, fullfile(target_directory, filename_top));
        imwrite(ABody, fullfile(target_directory, filename_body));
    end
end