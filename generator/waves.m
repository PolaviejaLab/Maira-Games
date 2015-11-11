function A = waves(image_size, tile_size, phase, water_level, amplitude, band_size, cfg)
%
% Creates an image composed of wave tiles
%  image_size - Size of image
%  tile_size - Size of a tile within the image
%  phase - Phase of the wave to plot (0 to 1)
%  water_level - Fraction of a tile height at which to start waves
%  amplitude - Amplitude of the wave as a fraction of tile height
%  band_size - Size of the banding in pixels
%

    if(nargin < 7)
        cfg = struct();
    end
    
    if(~isfield(cfg, 'c1'))
        cfg.c1 = [139 225 235] / 255;
    end
    
    if(~isfield(cfg, 'c2'))
        cfg.c2 = [162 231 238] / 255;
    end
    
    if(~isfield(cfg, 'c3'))
        cfg.c3 = [255 255 255] / 255;
    end    

    % Create blank image
    A = ones([image_size 3]);
    
    water_level = water_level * tile_size(1);
    amplitude = amplitude * tile_size(1);
    
    if(mod(tile_size(1), band_size) ~= 0)
        fprintf('Band size is: %d, while tile size is %d, ratio: %.2f\n', band_size, tile_size(1), tile_size(1) / band_size);
        warning('Band size will cause uneven or non-integer number of bands');
    end
    
    % Generate sinusoidal patterns       
    for y = 1:image_size(1)
        for x = 1:image_size(2)
            
            X = x;
            f = 1/tile_size(2);
            
            Y = y + amplitude + sin( ...
                2 * pi * (x * f + phase) ...
            ) * amplitude;

            value = floor((y - water_level) / band_size);
        
            if(y <= water_level)
                C = cfg.c3;
            else            
                if(mod(value, 2) == 0)            
                    C = cfg.c1;
                else
                    C = cfg.c2;
                end
            end

            % Round values
            X = round(X);
            Y = round(Y);
            
            % Exclude coordinates not within image
            if(X < 1 || Y < 1 || ...
                X > image_size(2) || ...
                Y > image_size(1))
                continue;
            end            

            A(Y, X, :) = C;
        end
    end
